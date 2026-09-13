import type { Metadata } from "next";
import { PenPaper } from "@/components/PenPaper";
import { SectionShell } from "@/components/SectionShell";

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

export default function MathPage() {
  return (
    <SectionShell>
      <PenPaper />
    </SectionShell>
  );
}
