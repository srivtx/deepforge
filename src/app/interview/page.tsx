import type { Metadata } from "next";
import { InterviewPrep } from "@/components/InterviewPrep";
import { SectionShell } from "@/components/SectionShell";

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

export default function InterviewPage() {
  return (
    <SectionShell>
      <InterviewPrep />
    </SectionShell>
  );
}
