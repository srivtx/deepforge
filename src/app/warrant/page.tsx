import type { Metadata } from "next";
import Link from "next/link";
import { PageShell } from "@/components/PageShell";
import { WarrantLab } from "@/components/warrant/WarrantLab";

const TITLE = "Warrant Lab";
const DESCRIPTION =
  "A browser-session lab for contestable derived claims: each claim carries an append-only challenge ledger, its grade is recomputed from that ledger and its cites, and an audit re-checks the arithmetic against a frozen head anchor. Nothing is stored or sent.";

export const metadata: Metadata = {
  title: "Warrant Lab — DeepForge",
  description: DESCRIPTION,
  alternates: {
    canonical: "/warrant",
  },
  openGraph: {
    title: "Warrant Lab — DeepForge",
    description: DESCRIPTION,
    url: "/warrant",
    type: "website",
    siteName: "DeepForge",
  },
  twitter: {
    card: "summary",
    title: "Warrant Lab — DeepForge",
    description: DESCRIPTION,
  },
};

const HOW_TO_READ: readonly string[] = [
  "Each claim card shows the claim's kind, payload, cites, its append-only ledger, and the recomputed grade γ.",
  "γ(v) = dead if any admitted refuted append is in the chain; otherwise the smallest of K = 3, the declared dependency classes D(chain), and the γ of every claim it cites.",
  "The class count reports declared check-families — the same family, or declared coverage overlap of at least one half — and not how much evidence exists.",
  "\"No challenge recorded\" is an empty ledger; absence of attempts is not survival, and no admitted refutations is not the same as none existing.",
  "Challenge, Why, and Audit are local reads or appends in this browser session. The frozen anchor predates the session, so a locally challenged claim audits with a head-mismatch.",
  "A refutation is recorded against the claim, never the person, and nothing here reads or writes learner state.",
];

export default function WarrantPage() {
  return (
    <PageShell title={TITLE} description={DESCRIPTION}>
      <WarrantLab />
      <section
        aria-label="How to read a warrant"
        className="mx-auto w-full max-w-6xl px-4 pb-12 sm:px-6 sm:pb-16"
      >
        <div className="rounded-lg border border-hairline bg-canvas-card p-4 sm:p-5">
          <h2 className="text-sm font-medium text-ink">How to read a warrant</h2>
          <ul className="mt-2 flex list-disc flex-col gap-1 pl-4 text-xs leading-relaxed text-body-mid">
            {HOW_TO_READ.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
          <p className="mt-3 text-xs leading-relaxed text-body-mid">
            This lab belongs to the{" "}
            <Link
              href="/inventions"
              className="text-accent underline-offset-2 hover:underline focus:outline-none focus-visible:ring-1 focus-visible:ring-accent/40"
            >
              inventions index
            </Link>
            , where the refutation-ledger paper and the other labs are listed.
          </p>
        </div>
      </section>
    </PageShell>
  );
}
