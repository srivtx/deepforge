import Link from "next/link";
import { ARTICLES } from "@/data/articles";

export function Articles() {
  return (
    <section
      id="articles"
      className="mx-auto max-w-6xl scroll-mt-16 px-4 py-10 sm:px-6 sm:py-14"
    >
      <div className="mb-6">
        <h2 className="text-sm font-medium text-body-mid">
          {ARTICLES.length} lessons · every demo runs locally
        </h2>
      </div>

      <div className="grid grid-cols-1 gap-3 md:grid-cols-2 lg:grid-cols-3">
        {ARTICLES.map((article) => {
          const demoCount = article.sections.filter(
            (s) => s.kind === "demo",
          ).length;
          return (
            <Link
              key={article.id}
              href={`/articles/${article.slug}`}
              aria-label={`Read ${article.title}, ${article.readMinutes} minute read`}
              className="flex flex-col gap-3 rounded-lg border border-hairline bg-canvas-card p-4 text-left transition-colors hover:border-accent/40 hover:bg-canvas-soft focus:outline-none focus-visible:ring-1 focus-visible:ring-accent/40 sm:p-5"
            >
              <div className="flex items-start justify-between gap-3">
                <span className="rounded-full border border-hairline px-2 py-0.5 text-[10px] font-medium text-body-mid">
                  {article.category}
                </span>
                <span className="shrink-0 font-mono text-[10px] text-mute">
                  {article.readMinutes} min
                </span>
              </div>
              <h3 className="text-base font-semibold text-ink">
                {article.title}
              </h3>
              <p className="text-sm leading-relaxed text-body">
                {article.dek}
              </p>
              <span className="mt-auto pt-1 font-mono text-[10px] text-accent">
                {demoCount} interactive demo{demoCount === 1 ? "" : "s"}{" "}
                <span aria-hidden>&rarr;</span>
              </span>
            </Link>
          );
        })}
      </div>
    </section>
  );
}
