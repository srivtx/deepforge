import type { Metadata } from "next";
import { Fragment } from "react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { PageShell } from "@/components/PageShell";
import { PaperProjectSection } from "@/components/papers/PaperProjectSection";
import { PaperQuestions } from "@/components/papers/PaperQuestions";
import { PaperReadBadge } from "@/components/papers/PaperReadBadge";
import { PaperSections } from "@/components/papers/PaperSections";
import { ARTICLES } from "@/data/articles";
import { CONCEPTS } from "@/data/concepts";
import { LABS } from "@/data/labs";
import {
  ERA_LABELS,
  PAPERS,
  getPaper,
  getPaperById,
  paperNeighbours,
} from "@/data/papers";
import type { Paper, PaperKind, PaperPractice } from "@/data/papers/types";
import { PROBLEM_META } from "@/data/problems/problem-meta";
import { RESEARCH_CHALLENGES } from "@/data/research";
import { cn } from "@/lib/utils";

const siteUrl = (
  process.env.NEXT_PUBLIC_SITE_URL ?? "https://deepforge.app"
).replace(/\/$/, "");

export const dynamicParams = false;

const KIND_LABELS: Record<PaperKind, string> = {
  paper: "Paper",
  report: "Report",
  announcement: "Announcement",
};

const CONCEPT_TITLES = new Map(CONCEPTS.map((concept) => [concept.id, concept.title]));
const LAB_TITLES = new Map(LABS.map((lab) => [lab.id, lab.title]));
const RESEARCH_TITLES = new Map(
  RESEARCH_CHALLENGES.map((challenge) => [challenge.id, challenge.title]),
);
const PROBLEM_TITLES = new Map(PROBLEM_META.map((problem) => [problem.id, problem.title]));

/**
 * The numbered flow sections, in the order they render on the page. Papers
 * with a project insert a "Build" step between implementation and keep going,
 * so the indices below are the no-project baseline.
 */
const FLOW_LINKS = [
  { id: "theory", index: 1, label: "Theory" },
  { id: "inside-paper", index: 2, label: "Inside the paper" },
  { id: "implementation", index: 3, label: "Implementation check" },
  { id: "keep-going", index: 4, label: "Keep going" },
] as const;
const ARTICLE_LINKS = new Map<string, { title: string; href: string }>();
for (const article of ARTICLES) {
  const link = { title: article.title, href: `/articles/${article.slug}` };
  ARTICLE_LINKS.set(article.id, link);
  ARTICLE_LINKS.set(article.slug, link);
}

export function generateStaticParams(): { slug: string }[] {
  return PAPERS.map((paper) => ({ slug: paper.slug }));
}

function paperDescription(paper: Paper): string {
  const text = paper.whatItIs.replace(/\s+/g, " ").trim();
  if (text.length <= 158) return text;
  return `${text.slice(0, 155).replace(/\s+\S*$/, "")}…`;
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const paper = getPaper(slug);
  if (!paper) return { title: "Paper not found" };

  const description = paperDescription(paper);
  const ogImage = {
    url: `${siteUrl}/og?title=${encodeURIComponent(paper.title)}&subtitle=${encodeURIComponent(
      `${paper.year} · ${ERA_LABELS[paper.era]}`,
    )}&kind=paper`,
    width: 1200,
    height: 630,
  };
  return {
    title: `${paper.title} — Paper`,
    description,
    alternates: {
      canonical: `/papers/${paper.slug}`,
    },
    openGraph: {
      title: `${paper.title} — Paper — DeepForge`,
      description,
      url: `/papers/${paper.slug}`,
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

interface PracticeItem {
  id: string;
  title: string;
  href: string;
}

interface PracticeGroup {
  label: string;
  items: PracticeItem[];
}

/** Resolve `paper.practice` against the real registries, skipping unknown ids. */
function resolvePractice(practice: PaperPractice | undefined): PracticeGroup[] {
  if (!practice) return [];
  const groups: PracticeGroup[] = [];

  const concepts = (practice.concepts ?? []).flatMap((id) => {
    const title = CONCEPT_TITLES.get(id);
    return title ? [{ id, title, href: "/concepts" }] : [];
  });
  if (concepts.length > 0) groups.push({ label: "Concepts", items: concepts });

  const labs = (practice.labs ?? []).flatMap((id) => {
    const title = LAB_TITLES.get(id);
    return title ? [{ id, title, href: `/labs/${id}` }] : [];
  });
  if (labs.length > 0) groups.push({ label: "Labs", items: labs });

  const research = (practice.research ?? []).flatMap((id) => {
    const title = RESEARCH_TITLES.get(id);
    return title ? [{ id, title, href: `/research/${id}` }] : [];
  });
  if (research.length > 0) groups.push({ label: "Research", items: research });

  const problems = (practice.problems ?? []).flatMap((id) => {
    const title = PROBLEM_TITLES.get(id);
    return title ? [{ id, title, href: `/problems/${id}` }] : [];
  });
  if (problems.length > 0) groups.push({ label: "Problems", items: problems });

  const articles = (practice.articles ?? []).flatMap((id) => {
    const link = ARTICLE_LINKS.get(id);
    return link ? [{ id, title: link.title, href: link.href }] : [];
  });
  if (articles.length > 0) groups.push({ label: "Articles", items: articles });

  return groups;
}

function FlowHeading({
  id,
  index,
  title,
}: {
  id: string;
  index: number;
  title: string;
}) {
  return (
    <h2
      id={id}
      className="scroll-mt-20 text-lg font-semibold tracking-tight text-ink"
    >
      <span className="font-mono text-sm text-accent">{index}</span>
      <span aria-hidden className="px-2 text-mute">
        ·
      </span>
      {title}
    </h2>
  );
}

export default async function PaperPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const paper = getPaper(slug);
  if (!paper) notFound();

  const { prev, next } = paperNeighbours(paper.id);
  const fromPaper = paper.lineage.from
    ? getPaperById(paper.lineage.from)
    : undefined;
  const toPapers = (paper.lineage.to ?? []).flatMap((id) => {
    const candidate = getPaperById(id);
    return candidate ? [candidate] : [];
  });
  const practiceGroups = resolvePractice(paper.practice);
  const hasProject = Boolean(paper.project);
  const flowLinks = hasProject
    ? [
        ...FLOW_LINKS.slice(0, 3),
        { id: "project", index: 4, label: "Build" },
        { id: "keep-going", index: 5, label: "Keep going" },
      ]
    : FLOW_LINKS;
  const keepGoingIndex = hasProject ? 5 : 4;
  const sourceHref = paper.arxivId
    ? `https://arxiv.org/abs/${paper.arxivId}`
    : paper.url;
  const sourceLabel = paper.arxivId ? `arXiv:${paper.arxivId}` : "Source";

  return (
    <PageShell>
      <div className="mx-auto flex w-full max-w-4xl flex-col gap-8 px-4 pt-6 pb-12 sm:px-6 sm:pt-8 sm:pb-16">
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
            href="/papers"
            className="rounded-sm transition-colors hover:text-ink focus:outline-none focus-visible:ring-1 focus-visible:ring-accent/40"
          >
            Papers
          </Link>
          <span className="flex min-w-0 max-w-full items-center gap-1.5">
            <span aria-hidden className="text-mute">
              /
            </span>
            <span className="min-w-0 truncate text-body">{paper.title}</span>
          </span>
        </nav>

        <header className="flex flex-col gap-3">
          <div className="flex flex-wrap items-center gap-2">
            <Link
              href={`/papers#era-${paper.era}`}
              className="rounded-full border border-hairline bg-canvas-card px-2 py-0.5 text-xs text-body-mid transition-colors hover:border-accent/40 hover:text-accent focus:outline-none focus-visible:ring-1 focus-visible:ring-accent/40"
            >
              {ERA_LABELS[paper.era]}
            </Link>
            <span className="rounded-full border border-hairline bg-canvas-card px-2 py-0.5 text-xs text-body-mid">
              {KIND_LABELS[paper.kind]}
            </span>
            <span
              className={cn(
                "rounded-full border px-2 py-0.5 text-xs font-medium",
                paper.tier === "core"
                  ? "border-accent/40 text-accent"
                  : "border-hairline text-body-mid",
              )}
            >
              {paper.tier === "core" ? "Core" : "Advanced"}
            </span>
            <span className="font-mono text-xs text-mute">{paper.year}</span>
            <span className="font-mono text-xs text-mute">
              ~{paper.theoryMinutes} min theory
            </span>
            <PaperReadBadge paperId={paper.id} />
          </div>
          <h1 className="break-words text-2xl font-semibold tracking-tight text-ink sm:text-3xl">
            {paper.title}
          </h1>
          <p className="max-w-3xl text-sm leading-relaxed text-body-mid">
            {paper.tagline}
          </p>
          <a
            href={sourceHref}
            target="_blank"
            rel="noreferrer"
            className="inline-flex w-fit items-center gap-1.5 rounded-sm text-xs text-body-mid transition-colors hover:text-accent focus:outline-none focus-visible:ring-1 focus-visible:ring-accent/40"
          >
            {sourceLabel}
            <svg width="12" height="12" viewBox="0 0 12 12" fill="none" aria-hidden>
              <path
                d="M3.5 2H10v6.5M10 2L2 10"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </a>
        </header>

        <nav aria-label="Paper flow" className="flex flex-wrap gap-2">
          {flowLinks.map((step) => (
            <a
              key={step.id}
              href={`#${step.id}`}
              className="inline-flex min-h-11 items-center gap-1.5 rounded-full border border-hairline bg-canvas-card px-3 text-xs text-body-mid transition-colors hover:border-accent/40 hover:text-ink focus:outline-none focus-visible:ring-1 focus-visible:ring-accent/40 sm:min-h-8"
            >
              <span aria-hidden className="font-mono text-[10px] text-accent">
                {step.index}
              </span>
              {step.label}
            </a>
          ))}
        </nav>

        <section
          aria-labelledby="where-this-sits"
          className="rounded-lg border border-hairline bg-canvas-card p-4 sm:p-5"
        >
          <h2 id="where-this-sits" className="text-sm font-medium text-body-mid">
            Where this sits
          </h2>
          <div className="mt-2 break-words text-sm leading-relaxed">
            {fromPaper && (
              <>
                <Link
                  href={`/papers/${fromPaper.slug}`}
                  className="text-body-mid transition-colors hover:text-accent focus:outline-none focus-visible:ring-1 focus-visible:ring-accent/40"
                >
                  {fromPaper.title}
                </Link>
                <span aria-hidden className="text-mute">
                  {"\u00A0→ "}
                </span>
              </>
            )}
            <span className="font-medium text-ink">{paper.title}</span>
            {toPapers.length > 0 && (
              <>
                <span aria-hidden className="text-mute">
                  {"\u00A0→ "}
                </span>
                {toPapers.map((candidate, index) => (
                  <Fragment key={candidate.id}>
                    <Link
                      href={`/papers/${candidate.slug}`}
                      className="text-body-mid transition-colors hover:text-accent focus:outline-none focus-visible:ring-1 focus-visible:ring-accent/40"
                    >
                      {candidate.title}
                    </Link>
                    {index < toPapers.length - 1 && (
                      <span aria-hidden className="text-mute">
                        {"\u00A0· "}
                      </span>
                    )}
                  </Fragment>
                ))}
              </>
            )}
          </div>
          <p className="mt-3 whitespace-pre-wrap text-sm leading-relaxed text-body">
            {paper.lineage.context}
          </p>
          {paper.lineage.improved.length > 0 && (
            <ul className="mt-3 space-y-1.5">
              {paper.lineage.improved.map((item, index) => (
                <li
                  key={index}
                  className="flex gap-2 text-xs leading-relaxed text-body-mid"
                >
                  <span aria-hidden className="shrink-0 text-accent">
                    +
                  </span>
                  <span className="min-w-0">{item}</span>
                </li>
              ))}
            </ul>
          )}
        </section>

        <section aria-labelledby="what-it-is">
          <h2 id="what-it-is" className="text-sm font-medium text-body-mid">
            What it is
          </h2>
          <p className="mt-2 max-w-3xl whitespace-pre-wrap break-words text-sm leading-relaxed text-body">
            {paper.whatItIs}
          </p>
        </section>

        <section aria-labelledby="theory" className="flex flex-col gap-4">
          <FlowHeading
            id="theory"
            index={1}
            title="Theory from first principles"
          />
          <PaperSections sections={paper.theory} />
        </section>

        <section aria-labelledby="inside-paper" className="flex flex-col gap-4">
          <FlowHeading id="inside-paper" index={2} title="Inside the paper" />
          <PaperSections sections={paper.paper} />
        </section>

        <section
          aria-labelledby="implementation"
          className="flex flex-col gap-4"
        >
          <FlowHeading
            id="implementation"
            index={3}
            title="Implementation check"
          />
          <PaperQuestions
            paperId={paper.id}
            title={paper.title}
            questions={paper.questions}
          />
        </section>

        {paper.project && (
          <section aria-labelledby="project" className="flex flex-col gap-4">
            <FlowHeading id="project" index={4} title="Build it yourself" />
            <PaperProjectSection project={paper.project} />
          </section>
        )}

        <section aria-labelledby="keep-going" className="flex flex-col gap-4">
          <FlowHeading
            id="keep-going"
            index={keepGoingIndex}
            title="Keep going"
          />
          {(prev || next) && (
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              {prev && (
                <Link
                  href={`/papers/${prev.slug}`}
                  className="flex min-w-0 flex-col gap-1 rounded-lg border border-hairline bg-canvas-card p-3 transition-colors hover:border-accent/40 hover:bg-canvas-soft focus:outline-none focus-visible:ring-1 focus-visible:ring-accent/40"
                >
                  <span className="font-mono text-[10px] text-mute">
                    previous
                  </span>
                  <span className="break-words text-sm text-ink">
                    {prev.title}
                  </span>
                </Link>
              )}
              {next && (
                <Link
                  href={`/papers/${next.slug}`}
                  className="flex min-w-0 flex-col gap-1 rounded-lg border border-hairline bg-canvas-card p-3 transition-colors hover:border-accent/40 hover:bg-canvas-soft focus:outline-none focus-visible:ring-1 focus-visible:ring-accent/40 sm:text-right"
                >
                  <span className="font-mono text-[10px] text-mute">next</span>
                  <span className="break-words text-sm text-ink">
                    {next.title}
                  </span>
                </Link>
              )}
            </div>
          )}
          {practiceGroups.length > 0 && (
            <div className="flex flex-col gap-4">
              {practiceGroups.map((group) => (
                <div key={group.label}>
                  <h3 className="text-xs font-medium text-body-mid">
                    {group.label}
                  </h3>
                  <ul className="mt-1.5 flex flex-wrap gap-2">
                    {group.items.map((item) => (
                      <li key={item.id} className="min-w-0 max-w-full">
                        <Link
                          href={item.href}
                          className="inline-flex max-w-full items-center rounded-lg border border-hairline bg-canvas-card px-3 py-2 text-sm text-body transition-colors hover:border-accent/40 hover:text-ink focus:outline-none focus-visible:ring-1 focus-visible:ring-accent/40"
                        >
                          <span className="min-w-0 truncate">{item.title}</span>
                        </Link>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          )}
        </section>
      </div>
    </PageShell>
  );
}
