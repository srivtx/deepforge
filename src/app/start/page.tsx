import type { Metadata } from "next";
import { PageShell } from "@/components/PageShell";
import { Onboarding } from "@/components/onboarding/Onboarding";
import { PAGE_HEADER } from "@/components/onboarding/layout";

const TITLE = "Find your starting point";

const description =
  "A 2–3 minute placement check built from real DeepForge problems. Answer honestly and get a starting level, two or three learning paths that fit, and a first problem set.";

const blurb =
  "Eight to twelve real problems, about three minutes. No account, no score — just enough signal to pick where to begin.";

export const metadata: Metadata = {
  title: TITLE,
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
    <PageShell>
      <header className={PAGE_HEADER}>
        <h1 className="text-2xl font-semibold tracking-tight text-ink sm:text-3xl">
          {TITLE}
        </h1>
        <p className="mt-2 text-sm leading-relaxed text-body-mid">{blurb}</p>
      </header>
      <Onboarding />
    </PageShell>
  );
}
