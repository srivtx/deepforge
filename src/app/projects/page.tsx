import type { Metadata } from "next";
import { Projects } from "@/components/Projects";
import { SectionShell } from "@/components/SectionShell";

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

export default function ProjectsPage() {
  return (
    <SectionShell>
      <Projects />
    </SectionShell>
  );
}
