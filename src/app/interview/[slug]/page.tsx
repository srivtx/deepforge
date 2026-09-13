import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { PageShell } from "@/components/PageShell";
import { INTERVIEW_TRACKS } from "@/data/interview";
import { PROBLEM_META, type ProblemMeta } from "@/data/problems/problem-meta";
import { InterviewTrackDetail } from "./InterviewTrackDetail";

const siteUrl = (
  process.env.NEXT_PUBLIC_SITE_URL ?? "https://deepforge.app"
).replace(/\/$/, "");

const META_BY_ID = new Map(PROBLEM_META.map((problem) => [problem.id, problem]));

type TrackEntry = (typeof INTERVIEW_TRACKS)[number];

export const dynamicParams = false;

function getTrack(slug: string): TrackEntry | undefined {
  return INTERVIEW_TRACKS.find((track) => track.id === slug);
}

function trackDescription(track: TrackEntry): string {
  const summary = track.blurb.replace(/\s+/g, " ").trim();
  const text = `${summary} ${track.problemIds.length} problems across ${track.phases.length} phases, with a timed mock on DeepForge.`;
  if (text.length <= 158) return text;
  return `${text.slice(0, 155).replace(/\s+\S*$/, "")}…`;
}

function ogImageFor(track: TrackEntry) {
  return {
    url: `${siteUrl}/og?title=${encodeURIComponent(
      track.title,
    )}&subtitle=${encodeURIComponent(
      `${track.problemIds.length} problems · Interview track`,
    )}`,
    width: 1200,
    height: 630,
  };
}

export function generateStaticParams(): { slug: string }[] {
  return INTERVIEW_TRACKS.map((track) => ({ slug: track.id }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const track = getTrack(slug);
  if (!track) return { title: "Interview track not found" };

  const description = trackDescription(track);
  const ogImage = ogImageFor(track);
  return {
    title: `${track.title} — Interview track`,
    description,
    alternates: {
      canonical: `/interview/${track.id}`,
    },
    openGraph: {
      title: `${track.title} — Interview track — DeepForge`,
      description,
      url: `/interview/${track.id}`,
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

export default async function InterviewTrackPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const track = getTrack(slug);
  if (!track) notFound();

  const problems = Array.from(new Set(track.problemIds))
    .map((id) => META_BY_ID.get(id))
    .filter((problem): problem is ProblemMeta => Boolean(problem));
  const url = `${siteUrl}/interview/${track.id}`;
  const description = trackDescription(track);

  const jsonLd = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "Course",
        "@id": `${url}#course`,
        name: `${track.title} — DeepForge interview track`,
        description,
        url,
        provider: {
          "@type": "Organization",
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
            name: "Interview prep",
            item: `${siteUrl}/interview`,
          },
          {
            "@type": "ListItem",
            position: 3,
            name: track.title,
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
        <InterviewTrackDetail track={track} problems={problems} />

        <footer className="border-t border-hairline pt-4 text-xs text-body-mid">
          <Link
            href="/interview"
            className="rounded-sm transition-colors hover:text-ink focus:outline-none focus-visible:ring-1 focus-visible:ring-accent/40"
          >
            All interview tracks
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
