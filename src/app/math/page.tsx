import type { Metadata } from "next";
import { PageShell } from "@/components/PageShell";
import { PenPaper } from "@/components/PenPaper";
import { SECTIONS_BY_ID } from "@/lib/sections";

const description =
  "No-code math problems answered by hand, with worked explanations. Sharpen the math behind machine learning.";

export const metadata: Metadata = {
  title: "Pen & Paper math",
  description,
  alternates: {
    canonical: "/math",
  },
  openGraph: {
    title: "Pen & Paper math — DeepForge",
    description,
    url: "/math",
    type: "website",
    siteName: "DeepForge",
  },
};

const { title, blurb } = SECTIONS_BY_ID.penpaper;

export default function MathPage() {
  return (
    <PageShell title={title} description={blurb}>
      <PenPaper />
    </PageShell>
  );
}
