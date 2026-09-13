import type { Metadata } from "next";
import { InterviewPrep } from "@/components/InterviewPrep";
import { PageShell } from "@/components/PageShell";
import { SECTIONS_BY_ID } from "@/lib/sections";

const description =
  "Company-style tracks and timed mocks, from warm-up problems to hard interview questions.";

export const metadata: Metadata = {
  title: "Interview prep",
  description,
  alternates: {
    canonical: "/interview",
  },
  openGraph: {
    title: "Interview prep — DeepForge",
    description,
    url: "/interview",
    type: "website",
    siteName: "DeepForge",
  },
};

const { title, blurb } = SECTIONS_BY_ID.interview;

export default function InterviewPage() {
  return (
    <PageShell title={title} description={blurb}>
      <InterviewPrep />
    </PageShell>
  );
}
