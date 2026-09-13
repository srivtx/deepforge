import type { Metadata } from "next";
import { PageShell } from "@/components/PageShell";
import { SubmitProblem } from "@/components/SubmitProblem";
import { SECTIONS_BY_ID } from "@/lib/sections";

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
    <PageShell
      title={SECTIONS_BY_ID.submit.title}
      description={SECTIONS_BY_ID.submit.blurb}
    >
      <SubmitProblem />
    </PageShell>
  );
}
