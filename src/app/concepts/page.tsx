import type { Metadata } from "next";
import { PageShell } from "@/components/PageShell";
import { ConceptsBrowser } from "@/components/concepts/ConceptsBrowser";
import { SECTIONS_BY_ID } from "@/lib/sections";

const description =
  "Browse every math checkpoint behind the problems, reveal the worked steps, and keep your spaced review up to date.";

export const metadata: Metadata = {
  title: "Concepts",
  description,
  alternates: {
    canonical: "/concepts",
  },
  openGraph: {
    title: "Concepts — DeepForge",
    description,
    url: "/concepts",
    type: "website",
    siteName: "DeepForge",
  },
};

const { title, blurb } = SECTIONS_BY_ID.concepts;

export default function ConceptsPage() {
  return (
    <PageShell title={title} description={blurb}>
      <ConceptsBrowser />
    </PageShell>
  );
}
