import type { Metadata } from "next";
import { SectionShell } from "@/components/SectionShell";
import { SubmitProblem } from "@/components/SubmitProblem";

const description =
  "Author a problem, validate it locally against the test runner, and export a ready-to-paste snippet.";

export const metadata: Metadata = {
  title: "Submit a problem",
  description,
  alternates: {
    canonical: "/submit",
  },
  openGraph: {
    title: "Submit a problem — DeepForge",
    description,
    url: "/submit",
    type: "website",
    siteName: "DeepForge",
  },
};

export default function SubmitPage() {
  return (
    <SectionShell>
      <SubmitProblem />
    </SectionShell>
  );
}
