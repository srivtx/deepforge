import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { PageShell } from "@/components/PageShell";
import { RESEARCH_CHALLENGES, type ResearchChallenge } from "@/data/research";
import { getResearchTheory } from "@/data/researchTheory";
import { ResearchDataPreview } from "@/components/viz/ResearchDataPreview";
import { BaselineBadges } from "@/components/research/BaselineBadges";
import { TheoryNotes } from "@/components/research/TheoryNotes";
import { RelatedProblems } from "@/components/research/RelatedProblems";
import { formatScore, metricLabel } from "@/components/research/format";
import { ResearchWorkspace } from "./ResearchWorkspace";

const siteUrl = (
  process.env.NEXT_PUBLIC_SITE_URL ?? "https://deepforge.app"
).replace(/\/$/, "");

export const dynamicParams = false;

function getChallengeById(id: string): ResearchChallenge | undefined {
  return RESEARCH_CHALLENGES.find((challenge) => challenge.id === id);
}

/** Focus-shaping difficulty for the OG card; cosmetic only. */
function challengeDifficulty(
  challenge: ResearchChallenge,
): "Easy" | "Medium" | "Hard" {
  if (challenge.points >= 35) return "Hard";
  if (challenge.points >= 25) return "Medium";
  return "Easy";
}

function challengeMetaDescription(challenge: ResearchChallenge): string {
  const blurb = challenge.blurb.replace(/\s+/g, " ").trim();
  if (blurb.length <= 158) return blurb;
  return `${blurb.slice(0, 155).replace(/\s+\S*$/, "")}…`;
}

export function generateStaticParams(): { id: string }[] {
  return RESEARCH_CHALLENGES.map((challenge) => ({ id: challenge.id }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  const { id } = await params;
  const challenge = getChallengeById(id);
  if (!challenge) return { title: "Research challenge not found" };

  const description = challengeMetaDescription(challenge);
  const ogImage = {
    url: `${siteUrl}/og?title=${encodeURIComponent(
      challenge.title,
    )}&subtitle=${encodeURIComponent(
      `${metricLabel(challenge.metric)} · baseline ${formatScore(
        challenge.baselineScore,
      )} (${challenge.baselineName})`,
    )}&kind=research&difficulty=${challengeDifficulty(challenge)}`,
    width: 1200,
    height: 630,
  };
  return {
    title: `${challenge.title} — Research`,
    description,
    alternates: {
      canonical: `/research/${challenge.id}`,
    },
    openGraph: {
      title: `${challenge.title} — Research — DeepForge`,
      description,
      url: `/research/${challenge.id}`,
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

export default async function ResearchChallengePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const challenge = getChallengeById(id);
  if (!challenge) notFound();

  const theory = getResearchTheory(challenge.id);
  const trainRows = challenge.trainData.features.length;
  const columns = challenge.trainData.features[0]?.length ?? 0;
  const testRows = challenge.testData.features.length;

  const stats = [
    {
      label: "Train",
      value: `${trainRows} × ${columns}`,
    },
    {
      label: "Hidden test",
      value: `${testRows} rows`,
    },
    {
      label: "Metric",
      value: `${metricLabel(challenge.metric)} · ${
        challenge.higherIsBetter ? "higher" : "lower"
      }`,
    },
    {
      label: "Baseline score",
      value: formatScore(challenge.baselineScore),
    },
  ];

  return (
    <PageShell>
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
            href="/research"
            className="rounded-sm transition-colors hover:text-ink focus:outline-none focus-visible:ring-1 focus-visible:ring-accent/40"
          >
            Research
          </Link>
          <span aria-hidden className="text-mute">
            /
          </span>
          <span className="min-w-0 max-w-full truncate text-body">
            {challenge.title}
          </span>
        </nav>

        <header className="flex flex-col gap-3">
          <div className="flex flex-wrap items-center gap-2">
            <span className="rounded-full border border-hairline bg-canvas-card px-2 py-0.5 text-xs text-body-mid">
              {metricLabel(challenge.metric)} ·{" "}
              {challenge.higherIsBetter ? "higher is better" : "lower is better"}
            </span>
            <span className="rounded-full border border-hairline bg-canvas-card px-2 py-0.5 text-xs text-body-mid">
              Baseline: {challenge.baselineName}
            </span>
            <span className="rounded-full border border-accent/40 bg-accent/5 px-2 py-0.5 text-xs font-medium text-accent">
              {challenge.points} pts
            </span>
            <BaselineBadges challenge={challenge} />
          </div>
          <h1 className="text-2xl font-semibold tracking-tight text-ink sm:text-3xl">
            {challenge.title}
          </h1>
          <p className="max-w-3xl text-sm leading-relaxed text-body">
            {challenge.blurb}
          </p>
        </header>

        <section
          aria-label="Challenge facts"
          className="grid grid-cols-2 gap-3 sm:grid-cols-4"
        >
          {stats.map((stat) => (
            <div
              key={stat.label}
              className="rounded-md border border-hairline bg-canvas-card p-3"
            >
              <div className="text-[11px] text-body-mid">{stat.label}</div>
              <div className="mt-0.5 font-mono text-sm text-ink">
                {stat.value}
              </div>
            </div>
          ))}
        </section>

        <section
          aria-labelledby="dataset-preview"
          className="rounded-lg border border-hairline bg-canvas-card p-4 sm:p-5"
        >
          <h2 id="dataset-preview" className="text-sm font-medium text-body-mid">
            Data preview
          </h2>
          <p className="mt-2 mb-4 max-w-3xl text-sm leading-relaxed text-body">
            {challenge.datasetDescription}
          </p>
          <ResearchDataPreview challenge={challenge} />
        </section>

        {theory && <TheoryNotes theory={theory} />}

        <details className="rounded-lg border border-hairline bg-canvas-soft">
          <summary className="cursor-pointer rounded-lg px-3 py-2 text-xs font-medium text-body-mid transition-colors hover:text-ink focus:outline-none focus-visible:ring-1 focus-visible:ring-accent/40">
            Hint
          </summary>
          <p className="border-t border-hairline px-3 py-2 text-sm leading-relaxed text-body">
            {challenge.hint}
          </p>
        </details>

        <ResearchWorkspace challenge={challenge} />

        <RelatedProblems challengeId={challenge.id} />

        <footer className="border-t border-hairline pt-4 text-xs text-body-mid">
          <Link
            href="/research"
            className="rounded-sm transition-colors hover:text-ink focus:outline-none focus-visible:ring-1 focus-visible:ring-accent/40"
          >
            All {RESEARCH_CHALLENGES.length} research challenges
          </Link>
          <span aria-hidden className="px-2 text-mute">
            ·
          </span>
          <span className="font-mono text-[10px] text-mute">
            {challenge.id}
          </span>
        </footer>
      </div>
    </PageShell>
  );
}
