import Link from "next/link";
import type { Article } from "@/data/articles";
import { resolveHandsOnLinks } from "./handsOn";

export function HandsOnBand({ article }: { article: Article }) {
  const links = resolveHandsOnLinks(article);
  if (links.length === 0) return null;

  return (
    <section
      aria-labelledby="hands-on-heading"
      className="rounded-lg border border-hairline bg-canvas-card p-4 sm:p-5"
    >
      <h2 id="hands-on-heading" className="text-sm font-semibold text-ink">
        Try it hands-on
      </h2>
      <p className="mt-1 text-xs text-body-mid">
        Run this topic on real data in a lab, or beat a baseline in a research
        challenge.
      </p>
      <div className="mt-3 flex flex-wrap gap-2">
        {links.map((link) => (
          <Link
            key={link.href}
            href={link.href}
            className="inline-flex min-h-11 max-w-full items-center gap-1.5 rounded-full border border-hairline bg-canvas px-2.5 py-1 text-xs text-body-mid transition-colors hover:border-accent/40 hover:bg-accent/5 hover:text-ink focus:outline-none focus-visible:ring-1 focus-visible:ring-accent/40 sm:min-h-0"
          >
            <span className="font-mono text-[10px] text-accent">
              {link.label}
            </span>
            <span className="min-w-0 truncate">{link.title}</span>
          </Link>
        ))}
      </div>
    </section>
  );
}
