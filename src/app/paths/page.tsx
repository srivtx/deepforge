import type { Metadata } from "next";
import Link from "next/link";
import { LEARNING_PATHS, PROBLEMS } from "@/data/problems";
import { getAllPaths } from "@/lib/paths";
import { PathsBrowser } from "./PathsBrowser";

const siteUrl = (
  process.env.NEXT_PUBLIC_SITE_URL ?? "https://deepforge.app"
).replace(/\/$/, "");

const resolvedPaths = getAllPaths();
const knownProblemIds = new Set(PROBLEMS.map((problem) => problem.id));
const distinctProblemIds = new Set<string>();
let totalHours = 0;
for (const path of resolvedPaths) {
  totalHours += path.estimatedHours;
  for (const id of path.problemIds) distinctProblemIds.add(id);
}
const distinctProblems = [...distinctProblemIds].filter((id) =>
  knownProblemIds.has(id),
).length;

const description = `Follow structured learning paths that sequence DeepForge problems into a curriculum — from math foundations and ML from scratch to deep learning, algorithms, and interview prep. ${resolvedPaths.length} paths, ${distinctProblems} problems, about ${totalHours} hours of guided practice.`;

export const metadata: Metadata = {
  title: "Learning paths",
  description,
  alternates: {
    canonical: "/paths",
  },
  openGraph: {
    title: "Learning paths — DeepForge",
    description,
    url: "/paths",
    type: "website",
    siteName: "DeepForge",
  },
  twitter: {
    card: "summary_large_image",
    title: "Learning paths — DeepForge",
    description,
  },
};

export default function PathsPage() {
  const jsonLd = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "CollectionPage",
        "@id": `${siteUrl}/paths#page`,
        name: "DeepForge learning paths",
        description,
        url: `${siteUrl}/paths`,
        isPartOf: {
          "@type": "WebSite",
          name: "DeepForge",
          url: siteUrl,
        },
      },
      {
        "@type": "BreadcrumbList",
        "@id": `${siteUrl}/paths#breadcrumb`,
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
        ],
      },
    ],
  };

  return (
    <main className="flex w-full flex-1 flex-col">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(jsonLd).replace(/</g, "\\u003c"),
        }}
      />

      <div className="mx-auto flex w-full max-w-6xl flex-col gap-4 px-4 pt-10 sm:px-6 sm:pt-14">
        <nav
          aria-label="Breadcrumb"
          className="flex flex-wrap items-center gap-1.5 text-xs text-body-mid"
        >
          <Link href="/" className="transition-colors hover:text-ink">
            Home
          </Link>
          <span className="text-mute">/</span>
          <span className="text-body">Learning paths</span>
        </nav>

        <header className="flex flex-col gap-3">
          <h1 className="text-2xl font-semibold tracking-tight text-ink sm:text-3xl">
            Learning paths
          </h1>
          <p className="max-w-2xl text-sm leading-relaxed text-body">
            Ordered sequences of problems that build one skill at a time, from
            vectors and gradients to backprop, attention, and interview-ready
            algorithms. Pick a path, work through it in order, and your progress
            saves automatically.
          </p>
          <div className="flex flex-wrap items-center gap-3 text-xs text-body-mid">
            <span className="font-mono">{resolvedPaths.length} paths</span>
            <span className="text-mute">·</span>
            <span className="font-mono">{distinctProblems} problems</span>
            <span className="text-mute">·</span>
            <span className="font-mono">~{totalHours}h total</span>
          </div>
        </header>
      </div>

      <PathsBrowser paths={LEARNING_PATHS} problems={PROBLEMS} />

      <footer className="mx-auto w-full max-w-6xl px-4 pb-10 text-xs text-body-mid sm:px-6 sm:pb-14">
        <div className="border-t border-hairline pt-4">
          <Link href="/problems" className="transition-colors hover:text-ink">
            Browse all {PROBLEMS.length} problems
          </Link>
          <span className="px-2 text-mute">·</span>
          <Link href="/" className="transition-colors hover:text-ink">
            DeepForge home
          </Link>
        </div>
      </footer>
    </main>
  );
}
