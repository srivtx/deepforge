import type { Metadata } from "next";
import { PageShell } from "@/components/PageShell";
import {
  PapersIndex,
  type PaperCardEntry,
} from "@/components/papers/PapersIndex";
import { PAPERS, PAPER_ERAS } from "@/data/papers";
import { SECTIONS_BY_ID } from "@/lib/sections";

const { blurb } = SECTIONS_BY_ID.papers;

const TITLE = "Understanding Papers";

export const metadata: Metadata = {
  title: TITLE,
  description: blurb,
  alternates: {
    canonical: "/papers",
  },
  openGraph: {
    title: "Understanding Papers — DeepForge",
    description: blurb,
    url: "/papers",
    type: "website",
    siteName: "DeepForge",
  },
};

export default function PapersPage() {
  // The index only needs the light card fields, so the client component never
  // imports the curriculum prose itself.
  const papers: PaperCardEntry[] = PAPERS.map((paper, index) => ({
    id: paper.id,
    slug: paper.slug,
    title: paper.title,
    year: paper.year,
    kind: paper.kind,
    tier: paper.tier,
    tagline: paper.tagline,
    theoryMinutes: paper.theoryMinutes,
    era: paper.era,
    order: index + 1,
    questionIds: paper.questions.map((question) => question.id),
  }));

  return (
    <PageShell title={TITLE} description={blurb}>
      <PapersIndex papers={papers} eras={PAPER_ERAS} />
    </PageShell>
  );
}
