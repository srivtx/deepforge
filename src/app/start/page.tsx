import type { Metadata } from "next";
import { PageShell } from "@/components/PageShell";
import { Onboarding } from "@/components/onboarding/Onboarding";

const description =
  "A 2–3 minute placement check built from real DeepForge problems. Answer honestly and get a starting level, two or three learning paths that fit, and a first problem set.";

export const metadata: Metadata = {
  title: "Find your starting point",
  description,
  alternates: {
    canonical: "/start",
  },
  openGraph: {
    title: "Find your starting point — DeepForge",
    description,
    url: "/start",
    type: "website",
    siteName: "DeepForge",
  },
};

export default function StartPage() {
  return (
    <PageShell
      eyebrow="Getting started"
      title="Find your starting point"
      description="Eight to twelve real problems, about three minutes. No account, no score — just enough signal to pick where to begin."
    >
      <Onboarding />
    </PageShell>
  );
}
