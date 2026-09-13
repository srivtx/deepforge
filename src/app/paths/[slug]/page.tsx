import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { PageShell } from "@/components/PageShell";
import { getProblemById } from "@/data/problems";
import type { Problem } from "@/types/problem";
import type { ResolvedLearningPath } from "@/lib/paths";
import {
  adjacentPaths,
  flattenPathProblems,
  getAllPaths,
  getPathBySlug,
} from "@/lib/paths";
import { PathDetail } from "./PathDetail";

const siteUrl = (
  process.env.NEXT_PUBLIC_SITE_URL ?? "https://deepforge.app"
).replace(/\/$/, "");

export const dynamicParams = false;

function pathMetaDescription(path: ResolvedLearningPath): string {
  const summary = path.description.replace(/\s+/g, " ").trim();
  const stageText = path.hasStages
    ? ` across ${path.stages.length} stages`
    : "";
  const text = `${summary} ${path.problemIds.length} guided problems${stageText}, about ${path.estimatedHours} hours on DeepForge.`;
  if (text.length <= 158) return text;
  return `${text.slice(0, 155).replace(/\s+\S*$/, "")}…`;
}

export function generateStaticParams(): { slug: string }[] {
  return getAllPaths().map((path) => ({ slug: path.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const path = getPathBySlug(slug);
  if (!path) return { title: "Learning path not found" };

  const description = pathMetaDescription(path);
  const ogImage = {
    url: `${siteUrl}/og?title=${encodeURIComponent(
      path.title,
    )}&subtitle=${encodeURIComponent(
      `${path.problemIds.length} problems · ~${path.estimatedHours}h`,
    )}`,
    width: 1200,
    height: 630,
  };
  return {
    title: `${path.title} — Learning path`,
    description,
    alternates: {
      canonical: `/paths/${path.slug}`,
    },
    openGraph: {
      title: `${path.title} — Learning path — DeepForge`,
      description,
      url: `/paths/${path.slug}`,
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

export default async function LearningPathPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const path = getPathBySlug(slug);
  if (!path) notFound();

  const problems = flattenPathProblems(path)
    .map((id) => getProblemById(id))
    .filter((problem): problem is Problem => Boolean(problem));
  const { prev, next } = adjacentPaths(path.slug);
  const url = `${siteUrl}/paths/${path.slug}`;
  const description = pathMetaDescription(path);

  const jsonLd = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "CollectionPage",
        "@id": `${url}#page`,
        name: `${path.title} — DeepForge learning path`,
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
            name: "Learning paths",
            item: `${siteUrl}/paths`,
          },
          {
            "@type": "ListItem",
            position: 3,
            name: path.title,
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
            href="/paths"
            className="rounded-sm transition-colors hover:text-ink focus:outline-none focus-visible:ring-1 focus-visible:ring-accent/40"
          >
            Learning paths
          </Link>
          <span aria-hidden className="text-mute">
            /
          </span>
          <span className="text-body">{path.title}</span>
        </nav>

        <PathDetail path={path} problems={problems} prev={prev} next={next} />

        <footer className="border-t border-hairline pt-4 text-xs text-body-mid">
          <Link
            href="/paths"
            className="rounded-sm transition-colors hover:text-ink focus:outline-none focus-visible:ring-1 focus-visible:ring-accent/40"
          >
            All learning paths
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
