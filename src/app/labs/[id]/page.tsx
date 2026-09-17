import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { PageShell } from "@/components/PageShell";
import { LABS, type Lab } from "@/data/labs";
import { getProblemById } from "@/data/problems";
import { CATEGORIES } from "@/data/problems/meta";
import { getLabTheory } from "@/data/labTheory";
import { LabDataPreview } from "@/components/viz/LabDataPreview";
import { LabStatusBadge } from "@/components/labs/LabStatusBadge";
import { getLabRelated } from "@/components/labs/related";
import { directionArrow, formatScore } from "@/components/labs/helpers";
import { metricLabel } from "@/lib/labs";
import { categorySlug } from "@/lib/sections";
import { cn, difficultyClasses } from "@/lib/utils";
import { LabWorkspace } from "./LabWorkspace";

const siteUrl = (
  process.env.NEXT_PUBLIC_SITE_URL ?? "https://deepforge.app"
).replace(/\/$/, "");

export const dynamicParams = false;

export function generateStaticParams(): { id: string }[] {
  return LABS.map((lab) => ({ id: lab.id }));
}

export function labMetaDescription(lab: Lab): string {
  const text = lab.blurb.replace(/\s+/g, " ").trim();
  if (text.length <= 158) return text;
  return `${text.slice(0, 155).replace(/\s+\S*$/, "")}…`;
}

function findLab(id: string): Lab | undefined {
  return LABS.find((lab) => lab.id === id);
}

export function labCategorySlug(lab: Lab): string | undefined {
  const related = getLabRelated(lab.id);
  if (!related) return undefined;
  const slug = categorySlug(related.category);
  return CATEGORIES.some((entry) => categorySlug(entry.name) === slug)
    ? slug
    : undefined;
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  const { id } = await params;
  const lab = findLab(id);
  if (!lab) return { title: "Lab not found" };

  const description = labMetaDescription(lab);
  const ogImage = {
    url: `${siteUrl}/og?title=${encodeURIComponent(lab.title)}&subtitle=${encodeURIComponent(
      `${lab.category} · ${lab.difficulty}`,
    )}&kind=lab&difficulty=${lab.difficulty}`,
    width: 1200,
    height: 630,
  };
  return {
    title: `${lab.title} — Lab`,
    description,
    alternates: {
      canonical: `/labs/${lab.id}`,
    },
    openGraph: {
      title: `${lab.title} — Lab — DeepForge`,
      description,
      url: `/labs/${lab.id}`,
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

export default async function LabPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const lab = findLab(id);
  if (!lab) notFound();

  const theory = getLabTheory(lab.id);
  const related = getLabRelated(lab.id);
  const slug = labCategorySlug(lab);
  const relatedProblems = (related?.problems ?? [])
    .map((problemId) => getProblemById(problemId))
    .filter((problem) => problem !== undefined);
  const minutes = Math.round(lab.timeLimitSeconds / 60);
  const dims = lab.trainData.features[0]?.length ?? 0;
  const url = `${siteUrl}/labs/${lab.id}`;
  const description = labMetaDescription(lab);

  const jsonLd = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "LearningResource",
        "@id": `${url}#resource`,
        name: lab.title,
        description,
        url,
        learningResourceType: "Coding exercise",
        educationalLevel: lab.difficulty,
        educationalUse: "practice",
        inLanguage: "en",
        isAccessibleForFree: true,
        about: lab.category,
        keywords: [
          lab.category,
          lab.difficulty,
          metricLabel(lab.metric),
          "Python",
          "machine learning",
          "lab",
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
          { "@type": "ListItem", position: 1, name: "Home", item: siteUrl },
          {
            "@type": "ListItem",
            position: 2,
            name: "Labs",
            item: `${siteUrl}/labs`,
          },
          {
            "@type": "ListItem",
            position: 3,
            name: lab.title,
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
            href="/labs"
            className="rounded-sm transition-colors hover:text-ink focus:outline-none focus-visible:ring-1 focus-visible:ring-accent/40"
          >
            Labs
          </Link>
          <span aria-hidden className="text-mute">
            /
          </span>
          <span className="min-w-0 max-w-full truncate text-body">
            {lab.title}
          </span>
        </nav>

        <header className="flex flex-col gap-3">
          <div className="flex flex-wrap items-center gap-2">
            {slug ? (
              <Link
                href={`/categories/${slug}`}
                className="rounded-full border border-hairline bg-canvas-card px-2 py-0.5 text-xs text-body-mid transition-colors hover:border-accent/40 hover:text-accent focus:outline-none focus-visible:ring-1 focus-visible:ring-accent/40"
              >
                {lab.category}
              </Link>
            ) : (
              <span className="rounded-full border border-hairline bg-canvas-card px-2 py-0.5 text-xs text-body-mid">
                {lab.category}
              </span>
            )}
            <span
              className={cn(
                "rounded-full border px-2 py-0.5 text-xs font-medium",
                difficultyClasses(lab.difficulty),
              )}
            >
              {lab.difficulty}
            </span>
            <span className="font-mono text-xs text-body-mid">
              {minutes} min
            </span>
            <span className="font-mono text-xs text-body-mid">
              {lab.points} pts
            </span>
            <LabStatusBadge lab={lab} />
          </div>
          <h1 className="text-2xl font-semibold tracking-tight text-ink sm:text-3xl">
            {lab.title}
          </h1>
          <p className="max-w-3xl text-sm leading-relaxed text-body">
            {lab.blurb}
          </p>
        </header>

        <section
          aria-label="Lab facts"
          className="grid grid-cols-2 gap-3 lg:grid-cols-4"
        >
          <div className="rounded-lg border border-hairline bg-canvas-card p-3 sm:p-4">
            <div className="text-[10px] text-body-mid">Train split</div>
            <div className="mt-1 font-mono text-sm text-ink">
              {lab.trainData.features.length} × {dims}
            </div>
            <div className="mt-1 text-[11px] text-mute">rows × features</div>
          </div>
          <div className="rounded-lg border border-hairline bg-canvas-card p-3 sm:p-4">
            <div className="text-[10px] text-body-mid">Hidden test</div>
            <div className="mt-1 font-mono text-sm text-ink">
              {lab.testData.features.length}
            </div>
            <div className="mt-1 text-[11px] text-mute">
              held-out rows scored per run
            </div>
          </div>
          <div className="rounded-lg border border-hairline bg-canvas-card p-3 sm:p-4">
            <div className="text-[10px] text-body-mid">Metric</div>
            <div className="mt-1 font-mono text-sm text-ink">
              {metricLabel(lab.metric)} {directionArrow(lab)}
            </div>
            <div className="mt-1 text-[11px] text-mute">
              {lab.higherIsBetter ? "higher is better" : "lower is better"}
            </div>
          </div>
          <div className="rounded-lg border border-hairline bg-canvas-card p-3 sm:p-4">
            <div className="text-[10px] text-body-mid">Baseline → Target</div>
            <div className="mt-1 font-mono text-sm text-ink">
              {formatScore(lab, lab.baseline)} → {formatScore(lab, lab.target)}
            </div>
            <div className="mt-1 text-[11px] text-mute">
              beat the baseline to pass
            </div>
          </div>
        </section>

        <div className="grid grid-cols-1 items-start gap-6 lg:grid-cols-2">
          <section className="rounded-lg border border-hairline bg-canvas-card p-4 sm:p-5">
            <h2 className="mb-3 text-sm font-medium text-body-mid">Dataset</h2>
            <LabDataPreview lab={lab} />
          </section>

          <section className="rounded-lg border border-hairline bg-canvas-card p-4 sm:p-5">
            <h2 className="mb-3 text-sm font-medium text-body-mid">
              Rules of the run
            </h2>
            <ul className="space-y-1.5">
              {lab.constraints.map((constraint) => (
                <li
                  key={constraint}
                  className="flex gap-2 text-sm leading-relaxed text-body"
                >
                  <span className="text-mute" aria-hidden>
                    ·
                  </span>
                  <span>{constraint}</span>
                </li>
              ))}
            </ul>

            <details className="mt-5 rounded-lg border border-hairline bg-canvas-soft">
              <summary className="cursor-pointer rounded-lg px-3 py-2 text-xs font-medium text-body-mid transition-colors hover:text-ink focus:outline-none focus-visible:ring-1 focus-visible:ring-accent/40">
                Hint
              </summary>
              <p className="border-t border-hairline px-3 py-2 text-sm leading-relaxed text-body">
                {lab.hint}
              </p>
            </details>
          </section>
        </div>

        {theory && (
          <section
            aria-label="What this lab teaches"
            className="rounded-lg border border-hairline bg-canvas-card p-4 sm:p-5"
          >
            <h2 className="text-lg font-semibold tracking-tight text-ink">
              What this lab teaches
            </h2>
            <p className="mt-2 max-w-3xl text-sm leading-relaxed text-body">
              {theory.teaches}
            </p>
            <div className="mt-4 grid grid-cols-1 gap-4 md:grid-cols-2">
              {theory.sections.map((section) => (
                <div key={section.heading}>
                  <h3 className="text-sm font-medium text-ink">
                    {section.heading}
                  </h3>
                  <p className="mt-1 text-sm leading-relaxed text-body">
                    {section.body}
                  </p>
                </div>
              ))}
            </div>
            {theory.pitfalls.length > 0 && (
              <div className="mt-4">
                <h3 className="text-sm font-medium text-body-mid">
                  Common pitfalls
                </h3>
                <ul className="mt-2 space-y-1.5">
                  {theory.pitfalls.map((pitfall) => (
                    <li
                      key={pitfall}
                      className="flex gap-2 text-sm leading-relaxed text-body"
                    >
                      <span className="text-warning" aria-hidden>
                        ·
                      </span>
                      <span>{pitfall}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </section>
        )}

        <LabWorkspace lab={lab} />

        <section
          aria-label="Related"
          className="flex flex-col gap-4 rounded-lg border border-hairline bg-canvas-card p-4 sm:p-5"
        >
          <h2 className="text-lg font-semibold tracking-tight text-ink">
            Related
          </h2>
          <div className="flex flex-wrap items-center gap-2">
            {slug && (
              <Link
                href={`/categories/${slug}`}
                className="rounded-full border border-accent/40 bg-accent/5 px-2.5 py-1 text-xs text-accent transition-colors hover:bg-accent/10 focus:outline-none focus-visible:ring-1 focus-visible:ring-accent/40"
              >
                More {related?.category} problems
              </Link>
            )}
            <Link
              href="/labs/trails"
              className="rounded-full border border-hairline bg-canvas-card px-2.5 py-1 text-xs text-body-mid transition-colors hover:border-accent/40 hover:text-accent focus:outline-none focus-visible:ring-1 focus-visible:ring-accent/40"
            >
              Lab trails
            </Link>
          </div>
          {relatedProblems.length > 0 && (
            <div className="flex flex-col divide-y divide-hairline overflow-hidden rounded-lg border border-hairline">
              {relatedProblems.map((problem) => (
                <Link
                  key={problem.id}
                  href={`/problems/${problem.id}`}
                  className="group flex items-center justify-between gap-3 bg-canvas px-4 py-3 transition-colors hover:bg-canvas-soft focus:outline-none focus-visible:ring-1 focus-visible:ring-inset focus-visible:ring-accent/40"
                >
                  <div className="min-w-0">
                    <div className="truncate text-sm font-medium text-ink group-hover:text-accent">
                      {problem.title}
                    </div>
                    <div className="font-mono text-[10px] text-mute">
                      {problem.id} · {problem.category}
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
          )}
        </section>

        <footer className="border-t border-hairline pt-4 text-xs text-body-mid">
          <Link
            href="/labs"
            className="rounded-sm transition-colors hover:text-ink focus:outline-none focus-visible:ring-1 focus-visible:ring-accent/40"
          >
            Browse all {LABS.length} labs
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
