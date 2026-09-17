import type { Metadata } from "next";
import { PageShell } from "@/components/PageShell";
import { Research } from "@/components/Research";
import { SECTIONS_BY_ID } from "@/lib/sections";

const description =
  "Beat a baseline model on a research-style task. If your code wins, it becomes the latest best result.";

export const metadata: Metadata = {
  title: "Research challenges",
  description,
  alternates: {
    canonical: "/research",
  },
  openGraph: {
    title: "Research challenges — DeepForge",
    description,
    url: "/research",
    type: "website",
    siteName: "DeepForge",
  },
};

const { title, blurb } = SECTIONS_BY_ID.research;

export default function ResearchPage() {
  return (
    <PageShell title={title} description={blurb}>
      <div className="-mt-4 sm:-mt-6">
        <Research />
      </div>
    </PageShell>
  );
}
