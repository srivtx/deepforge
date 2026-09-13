import type { Metadata } from "next";
import Link from "next/link";
import { About } from "@/components/About";
import { PageShell } from "@/components/PageShell";
import { SECTIONS_BY_ID } from "@/lib/sections";

const description =
  "What DeepForge is, who built it, and why — a free, open-source practice platform for ML, math, and engineering.";

export const metadata: Metadata = {
  title: "About",
  description,
  alternates: {
    canonical: "/about",
  },
  openGraph: {
    title: "About — DeepForge",
    description,
    url: "/about",
    type: "website",
    siteName: "DeepForge",
  },
};

const { title, blurb } = SECTIONS_BY_ID.about;

export default function AboutPage() {
  return (
    <PageShell title={title} description={blurb}>
      <About />
      <section className="mx-auto w-full max-w-6xl px-4 pb-10 sm:px-6 sm:pb-14">
        <div className="flex flex-col gap-3 rounded-lg border border-hairline bg-canvas-card p-4 sm:flex-row sm:items-center sm:justify-between sm:gap-6 sm:p-5">
          <div className="min-w-0">
            <h2 className="text-lg font-semibold tracking-tight text-ink">
              Writing
            </h2>
            <p className="mt-1 text-sm leading-relaxed text-body-mid">
              Engineering notes on how DeepForge is built — the in-browser
              Python runtime, the problem pipeline, and the math under the
              hood.
            </p>
          </div>
          <Link
            href="/blog"
            className="inline-flex min-h-11 shrink-0 items-center justify-center rounded-md border border-accent/40 bg-accent/5 px-3 text-sm font-medium text-accent transition-colors hover:bg-accent/10 focus:outline-none focus-visible:ring-1 focus-visible:ring-accent/40 sm:min-h-0 sm:py-1.5"
          >
            Engineering blog
          </Link>
        </div>
      </section>
    </PageShell>
  );
}
