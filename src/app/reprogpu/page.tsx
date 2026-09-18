import type { Metadata } from "next";
import Link from "next/link";
import { PageShell } from "@/components/PageShell";
import { ReproGpuLab } from "@/components/reprogpu/ReproGpuLab";

const TITLE = "REPROGPU conformance lab";
const DESCRIPTION =
  "A read-only browser lab that compiles and dispatches the REPROGPU integer WGSL kernel subset, hashes the raw output bytes, and records a canonical cross-adapter manifest. Float is the negative control.";

export const metadata: Metadata = {
  title: "REPROGPU — DeepForge",
  description: DESCRIPTION,
  alternates: {
    canonical: "/reprogpu",
  },
  openGraph: {
    title: "REPROGPU — DeepForge",
    description: DESCRIPTION,
    url: "/reprogpu",
    type: "website",
    siteName: "DeepForge",
  },
  twitter: {
    card: "summary",
    title: "REPROGPU — DeepForge",
    description: DESCRIPTION,
  },
};

export default function ReproGpuPage() {
  return (
    <PageShell title={TITLE} description={DESCRIPTION}>
      <ReproGpuLab />
      <section
        aria-label="How to reproduce"
        className="mx-auto w-full max-w-6xl px-4 pb-12 sm:px-6 sm:pb-16"
      >
        <div className="rounded-lg border border-hairline bg-canvas-card p-4 sm:p-5">
          <h2 className="text-sm font-medium text-ink">How to reproduce</h2>
          <ol className="mt-2 flex list-decimal flex-col gap-1 pl-4 text-xs leading-relaxed text-body-mid">
            <li>Open this page in a browser that exposes WebGPU.</li>
            <li>Press Run conformance to compile and dispatch K1-K5.</li>
            <li>Download the manifest and keep its manifest hash.</li>
            <li>
              Compare each observed output hash against the committed pins
              printed in the lab, or run bun run verify:reprogpu to recompute
              the CPU references and the WGSL source pins.
            </li>
          </ol>
          <p className="mt-2 text-xs leading-relaxed text-body-mid">
            More artifacts and notes live in the{" "}
            <Link
              href="/inventions"
              className="text-accent underline-offset-2 hover:underline focus:outline-none focus-visible:ring-1 focus-visible:ring-accent/40"
            >
              inventions index
            </Link>
            .
          </p>
        </div>
      </section>
    </PageShell>
  );
}
