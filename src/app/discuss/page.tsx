import type { Metadata } from "next";
import { Discuss } from "@/components/Discuss";
import { SectionShell } from "@/components/SectionShell";

const description =
  "Ask questions and read threads from other solvers. Every problem has its own discussion.";

export const metadata: Metadata = {
  title: "Discuss",
  description,
  alternates: {
    canonical: "/discuss",
  },
  openGraph: {
    title: "Discuss — DeepForge",
    description,
    url: "/discuss",
    type: "website",
    siteName: "DeepForge",
  },
};

export default function DiscussPage() {
  return (
    <SectionShell>
      <Discuss />
    </SectionShell>
  );
}
