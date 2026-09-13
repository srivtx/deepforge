import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { PageShell } from "@/components/PageShell";
import { PostMeta, formatPostDate } from "@/components/blog";
import { POSTS, getAdjacentPosts, getPostBySlug } from "@/data/blog";
import { cn } from "@/lib/utils";

const siteUrl = (
  process.env.NEXT_PUBLIC_SITE_URL ?? "https://deepforge.app"
).replace(/\/$/, "");

export const dynamicParams = false;

function metaDescription(text: string): string {
  const clean = text.replace(/\s+/g, " ").trim();
  if (clean.length <= 158) return clean;
  return `${clean.slice(0, 155).replace(/\s+\S*$/, "")}…`;
}

export function generateStaticParams(): { slug: string }[] {
  return POSTS.map((entry) => ({ slug: entry.post.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const entry = getPostBySlug(slug);
  if (!entry) return { title: "Post not found" };

  const { post } = entry;
  const description = metaDescription(post.abstract);
  const ogImage = {
    url: `${siteUrl}/og?title=${encodeURIComponent(
      post.title,
    )}&subtitle=${encodeURIComponent(
      `${post.readingMinutes} min read · ${post.tags.join(" · ")}`,
    )}`,
    width: 1200,
    height: 630,
  };

  return {
    title: post.title,
    description,
    keywords: post.tags,
    authors: post.authors?.map((name) => ({ name })),
    alternates: {
      canonical: `/blog/${post.slug}`,
    },
    openGraph: {
      title: `${post.title} — DeepForge`,
      description,
      url: `/blog/${post.slug}`,
      type: "article",
      siteName: "DeepForge",
      publishedTime: post.date,
      authors: post.authors,
      tags: post.tags,
      images: [ogImage],
    },
    twitter: {
      card: "summary_large_image",
      images: [ogImage],
    },
  };
}

export default async function BlogPostPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const entry = getPostBySlug(slug);
  if (!entry) notFound();

  const { post, Content } = entry;
  const { previous, next } = getAdjacentPosts(post.slug);
  const url = `${siteUrl}/blog/${post.slug}`;
  const authors = post.authors?.length ? post.authors : ["svx"];
  const description = metaDescription(post.abstract);

  const jsonLd = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "TechArticle",
        "@id": `${url}#article`,
        headline: post.title,
        description,
        url,
        mainEntityOfPage: url,
        datePublished: post.date,
        dateModified: post.date,
        inLanguage: "en",
        keywords: post.tags.join(", "),
        author: authors.map((name) => ({
          "@type": "Person",
          name,
          url: "https://github.com/srivtx",
        })),
        publisher: {
          "@type": "Organization",
          name: "DeepForge",
          url: siteUrl,
        },
        image: `${siteUrl}/og?title=${encodeURIComponent(post.title)}`,
        isPartOf: {
          "@type": "WebSite",
          name: "DeepForge",
          url: siteUrl,
        },
      },
      {
        "@type": "BreadcrumbList",
        "@id": `${url}#breadcrumb`,
        itemListElement: [
          {
            "@type": "ListItem",
            position: 1,
            name: "Home",
            item: siteUrl,
          },
          {
            "@type": "ListItem",
            position: 2,
            name: "Engineering",
            item: `${siteUrl}/blog`,
          },
          {
            "@type": "ListItem",
            position: 3,
            name: post.title,
            item: url,
          },
        ],
      },
    ],
  };

  const navLink =
    "group flex h-full flex-col gap-1 rounded-lg border border-hairline bg-canvas-card p-4 transition-colors hover:border-accent/40 hover:bg-canvas-soft focus:outline-none focus-visible:ring-1 focus-visible:ring-accent/40";

  return (
    <PageShell>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(jsonLd).replace(/</g, "\\u003c"),
        }}
      />

      <div className="mx-auto w-full max-w-6xl px-4 py-10 sm:px-6 sm:py-14">
        <article className="mx-auto max-w-3xl">
          <nav aria-label="Breadcrumb" className="text-xs text-body-mid">
            <Link
              href="/blog"
              className="inline-flex min-h-11 items-center gap-1.5 rounded-md transition-colors hover:text-ink focus:outline-none focus-visible:ring-1 focus-visible:ring-accent/40 sm:min-h-0"
            >
              <span aria-hidden>&larr;</span> Engineering
            </Link>
          </nav>

          <header className="mt-4 sm:mt-6">
            <h1 className="text-2xl font-semibold tracking-tight text-ink sm:text-3xl">
              {post.title}
            </h1>
            <p className="mt-4 rounded-lg border border-hairline bg-canvas-card p-4 text-sm leading-relaxed text-body sm:p-5">
              {post.abstract}
            </p>
            <PostMeta post={post} className="mt-4" />
          </header>

          <div className="mt-8 sm:mt-10">
            <Content />
          </div>

          <nav
            aria-label="More posts"
            className="mt-12 grid grid-cols-1 gap-3 border-t border-hairline pt-6 sm:grid-cols-2"
          >
            {previous && (
              <Link
                href={`/blog/${previous.post.slug}`}
                className={navLink}
              >
                <span className="text-xs text-body-mid">&larr; Older</span>
                <span className="text-sm font-medium text-ink group-hover:text-accent">
                  {previous.post.title}
                </span>
              </Link>
            )}
            {next && (
              <Link
                href={`/blog/${next.post.slug}`}
                className={cn(navLink, "sm:text-right", !previous && "sm:col-start-2")}
              >
                <span className="text-xs text-body-mid">Newer &rarr;</span>
                <span className="text-sm font-medium text-ink group-hover:text-accent">
                  {next.post.title}
                </span>
              </Link>
            )}
          </nav>

          <div className="mt-6 text-center">
            <Link
              href="/blog"
              className="inline-flex min-h-11 items-center gap-1.5 rounded-md text-sm text-body-mid transition-colors hover:text-ink focus:outline-none focus-visible:ring-1 focus-visible:ring-accent/40 sm:min-h-0"
            >
              All posts
            </Link>
          </div>

          <footer className="mt-8 border-t border-hairline pt-4 text-xs text-body-mid">
            <span className="font-mono text-[11px] text-mute">
              {formatPostDate(post.date)}
            </span>
            <span aria-hidden className="px-2 text-mute">
              &middot;
            </span>
            <Link
              href="/blog"
              className="rounded-sm transition-colors hover:text-ink focus:outline-none focus-visible:ring-1 focus-visible:ring-accent/40"
            >
              Engineering blog
            </Link>
            <span aria-hidden className="px-2 text-mute">
              &middot;
            </span>
            <Link
              href="/"
              className="rounded-sm transition-colors hover:text-ink focus:outline-none focus-visible:ring-1 focus-visible:ring-accent/40"
            >
              DeepForge home
            </Link>
          </footer>
        </article>
      </div>
    </PageShell>
  );
}
