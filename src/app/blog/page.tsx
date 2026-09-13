import type { Metadata } from "next";
import Link from "next/link";
import { PageShell } from "@/components/PageShell";
import { PostMeta } from "@/components/blog";
import { Reveal } from "@/components/motion/Reveal";
import { POSTS } from "@/data/blog";

const title = "Engineering";
const description =
  "Notes from building DeepForge: verifying 5,050 problems with real Python, offline-first sync with Supabase, and the routing and performance work behind 24 destinations.";

export const metadata: Metadata = {
  title,
  description,
  alternates: {
    canonical: "/blog",
  },
  openGraph: {
    title: `${title} — DeepForge`,
    description,
    url: "/blog",
    type: "website",
    siteName: "DeepForge",
  },
  twitter: {
    card: "summary_large_image",
    title: `${title} — DeepForge`,
    description,
  },
};

export default function BlogIndexPage() {
  if (POSTS.length === 0) {
    return (
      <PageShell title={title} description={description}>
        <section className="mx-auto w-full max-w-6xl px-4 pb-10 pt-8 sm:px-6 sm:pb-14 sm:pt-10">
          <div className="rounded-lg border border-hairline bg-canvas-card px-5 py-14 text-center">
            <p className="text-sm text-body-mid">
              No posts yet. The first write-up is on the bench.
            </p>
            <Link
              href="/problems"
              className="mt-4 inline-flex min-h-11 items-center gap-1.5 rounded-lg border border-accent/40 bg-accent/5 px-3.5 py-1.5 text-sm font-medium text-accent transition-colors hover:bg-accent/10 focus:outline-none focus-visible:ring-1 focus-visible:ring-accent/40 sm:min-h-0"
            >
              Browse the problems
              <span aria-hidden>&rarr;</span>
            </Link>
          </div>
        </section>
      </PageShell>
    );
  }

  const [featured, ...rest] = POSTS;

  return (
    <PageShell title={title} description={description}>
      <section
        aria-label="Engineering posts"
        className="mx-auto w-full max-w-6xl px-4 pb-10 pt-8 sm:px-6 sm:pb-14 sm:pt-10"
      >
        <Reveal>
          <Link
            href={`/blog/${featured.post.slug}`}
            className="group flex flex-col gap-4 rounded-lg border border-hairline bg-canvas-card p-5 transition-colors hover:border-accent/40 hover:bg-canvas-soft focus:outline-none focus-visible:ring-1 focus-visible:ring-accent/40 sm:p-6"
          >
            <PostMeta post={featured.post} />
            <h2 className="text-xl font-semibold tracking-tight text-ink group-hover:text-accent sm:text-2xl">
              {featured.post.title}
            </h2>
            <p className="max-w-3xl text-sm leading-relaxed text-body">
              {featured.post.abstract}
            </p>
            <span className="mt-1 inline-flex items-center gap-1.5 text-xs font-medium text-accent">
              Read <span aria-hidden>&rarr;</span>
            </span>
          </Link>
        </Reveal>

        {rest.length > 0 && (
          <ul className="mt-3 grid grid-cols-1 gap-3 md:grid-cols-2">
            {rest.map((entry, index) => (
              <li key={entry.post.slug} className="h-full">
                <Reveal className="h-full" delay={(index + 1) * 60}>
                  <Link
                    href={`/blog/${entry.post.slug}`}
                    className="group flex h-full flex-col gap-3 rounded-lg border border-hairline bg-canvas-card p-4 transition-colors hover:border-accent/40 hover:bg-canvas-soft focus:outline-none focus-visible:ring-1 focus-visible:ring-accent/40 sm:p-5"
                  >
                    <PostMeta post={entry.post} />
                    <h2 className="text-base font-semibold tracking-tight text-ink group-hover:text-accent">
                      {entry.post.title}
                    </h2>
                    <p className="text-sm leading-relaxed text-body">
                      {entry.post.abstract}
                    </p>
                    <span className="mt-auto inline-flex items-center gap-1.5 pt-1 text-xs font-medium text-accent">
                      Read <span aria-hidden>&rarr;</span>
                    </span>
                  </Link>
                </Reveal>
              </li>
            ))}
          </ul>
        )}
      </section>
    </PageShell>
  );
}
