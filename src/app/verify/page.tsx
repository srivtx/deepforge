import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { PageShell } from "@/components/PageShell";
import { CREDENTIAL_PREFIX } from "@/lib/credentials";

export const metadata: Metadata = {
  title: "Verify a certificate",
  description:
    "Paste a certificate code to check that the claim inside it was not altered after issue. Deterministic, offline, and account-free.",
  alternates: {
    canonical: "/verify",
  },
  openGraph: {
    title: "Verify a certificate — DeepForge",
    description:
      "Paste a certificate code to check that the claim inside it was not altered after issue.",
    url: "/verify",
    type: "website",
    siteName: "DeepForge",
  },
};

const LINK =
  "rounded-sm text-accent underline decoration-accent/40 underline-offset-2 transition-colors hover:decoration-accent focus:outline-none focus-visible:ring-1 focus-visible:ring-accent/40";

function extractCode(raw: string): string {
  const trimmed = raw.trim();
  if (!trimmed) return "";
  const marker = "/verify/";
  const at = trimmed.lastIndexOf(marker);
  const tail = at >= 0 ? trimmed.slice(at + marker.length) : trimmed;
  return tail.split(/[?#]/)[0].replace(/\/+$/, "").trim();
}

export default async function VerifyIndexPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const params = await searchParams;
  const raw = params.code;
  const code = extractCode(typeof raw === "string" ? raw : "");
  if (code) redirect(`/verify/${encodeURIComponent(code)}`);

  return (
    <PageShell
      title="Verify a certificate"
      description="A certificate code is the certificate itself, written down. Check one here to confirm that nothing inside it changed after it was issued."
    >
      <div className="mx-auto w-full max-w-3xl px-4 py-8 sm:px-6 sm:py-10">
        <form
          action="/verify"
          method="get"
          className="rounded-xl border border-hairline bg-canvas-card p-4 sm:p-6"
        >
          <label
            htmlFor="certificate-code"
            className="block text-sm font-medium text-ink"
          >
            Certificate code
          </label>
          <p
            id="certificate-code-help"
            className="mt-1 text-xs leading-relaxed text-body-mid"
          >
            Codes start with <code className="font-mono">{CREDENTIAL_PREFIX}</code>.
            Copy one from the certificate you claimed, or paste the full
            verification link.
          </p>
          <div className="mt-3 flex flex-col gap-2 sm:flex-row">
            <input
              id="certificate-code"
              name="code"
              type="text"
              required
              autoComplete="off"
              autoCapitalize="none"
              spellCheck={false}
              aria-describedby="certificate-code-help"
              placeholder={`${CREDENTIAL_PREFIX}.…`}
              className="min-h-11 w-full rounded-lg border border-hairline bg-canvas px-3 font-mono text-sm text-ink transition-colors placeholder:text-mute focus:border-accent/50 focus:outline-none focus:ring-1 focus:ring-accent/40 sm:min-h-9"
            />
            <button
              type="submit"
              className="inline-flex min-h-11 shrink-0 items-center justify-center rounded-lg border border-accent/40 bg-accent/5 px-4 text-sm font-medium text-accent transition-colors hover:bg-accent/10 focus:outline-none focus-visible:ring-1 focus-visible:ring-accent/40 sm:min-h-9"
            >
              Verify
            </button>
          </div>
        </form>

        <section aria-labelledby="what-a-code-is" className="mt-8">
          <h2 id="what-a-code-is" className="text-base font-semibold text-ink">
            What a code is
          </h2>
          <div className="mt-3 grid gap-3 sm:grid-cols-3">
            <div className="rounded-lg border border-hairline bg-canvas-card p-3.5">
              <h3 className="text-xs font-medium text-ink">The claim</h3>
              <p className="mt-1.5 text-xs leading-relaxed text-body-mid">
                When a certificate is issued, its claim is written into one
                string: who it is for, what it covers, how much of it was
                completed, and the date. No account or database row is needed
                to read it back.
              </p>
            </div>
            <div className="rounded-lg border border-hairline bg-canvas-card p-3.5">
              <h3 className="text-xs font-medium text-ink">The fingerprint</h3>
              <p className="mt-1.5 text-xs leading-relaxed text-body-mid">
                A short fingerprint derived from the claim is appended to the
                code. Change one character of the claim and the fingerprint no
                longer describes it.
              </p>
            </div>
            <div className="rounded-lg border border-hairline bg-canvas-card p-3.5">
              <h3 className="text-xs font-medium text-ink">The check</h3>
              <p className="mt-1.5 text-xs leading-relaxed text-body-mid">
                This page reads the claim out of the code, recomputes its
                fingerprint, and compares the two. Match means intact; mismatch
                means something was edited after issue.
              </p>
            </div>
          </div>
        </section>

        <section
          aria-labelledby="what-this-proves"
          className="mt-6 rounded-lg border border-hairline bg-canvas-soft p-3.5"
        >
          <h2 id="what-this-proves" className="text-xs font-medium text-ink">
            What this proves — and what it does not
          </h2>
          <p className="mt-1.5 text-xs leading-relaxed text-body-mid">
            A valid check proves the fields were not altered after the
            certificate was issued. It is a self-attested record: it does not
            independently audit the work behind the certificate, and it needs
            no server, network, or private key to work.
          </p>
        </section>

        <p className="mt-8 text-sm leading-relaxed text-body-mid">
          Claimed certificates and their current codes are on{" "}
          <Link href="/certificates" className={LINK}>
            the certificates page
          </Link>
          ; your badges, quests, and profile are on{" "}
          <Link href="/badges" className={LINK}>
            the badges page
          </Link>
          .
        </p>
      </div>
    </PageShell>
  );
}
