import type { Metadata } from "next";
import { PageShell } from "@/components/PageShell";
import { ResearchOverview } from "@/components/inventions/ResearchOverview";

const TITLE = "Publications";
const DESCRIPTION =
  "One research agenda, six papers, and the evidence behind every claim. Nothing on this page has been peer reviewed, and every figure is traceable to a script and a paper in the repository.";

export const metadata: Metadata = {
  title: TITLE,
  description: DESCRIPTION,
  alternates: {
    canonical: "/inventions",
  },
  openGraph: {
    title: "Publications — DeepForge",
    description: DESCRIPTION,
    url: "/inventions",
    type: "website",
    siteName: "DeepForge",
  },
  twitter: {
    card: "summary",
    title: "Publications — DeepForge",
    description: DESCRIPTION,
  },
};

export default function InventionsIndexPage() {
  return (
    <PageShell title={TITLE} description={DESCRIPTION}>
      <ResearchOverview />
    </PageShell>
  );
}
