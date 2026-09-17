import type { Metadata } from "next";
import { PageShell } from "@/components/PageShell";
import { Projects } from "@/components/Projects";
import { PaperProjectsBand } from "@/components/papers/PaperProjectsBand";
import { SECTIONS_BY_ID } from "@/lib/sections";

const description =
  "Multi-step labs that build a working ML system one problem at a time — GPT from scratch, a neural network framework, a search engine, a recommender, and a CNN.";

export const metadata: Metadata = {
  title: "Machine learning projects",
  description,
  alternates: {
    canonical: "/projects",
  },
  openGraph: {
    title: "Machine learning projects — DeepForge",
    description,
    url: "/projects",
    type: "website",
    siteName: "DeepForge",
  },
};

const { title, blurb } = SECTIONS_BY_ID.projects;

export default function ProjectsPage() {
  return (
    <PageShell title={title} description={blurb}>
      <Projects />
      <PaperProjectsBand />
    </PageShell>
  );
}
