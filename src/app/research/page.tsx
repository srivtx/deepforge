import type { Metadata } from "next";
import { Research } from "@/components/Research";
import { SectionShell } from "@/components/SectionShell";

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

export default function ResearchPage() {
  return (
    <SectionShell>
      <Research />
    </SectionShell>
  );
}
