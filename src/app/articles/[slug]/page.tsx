import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { PageShell } from "@/components/PageShell";
import { ARTICLES, type Article } from "@/data/articles";
import { ArticleDetail } from "./ArticleDetail";

const siteUrl = (
  process.env.NEXT_PUBLIC_SITE_URL ?? "https://deepforge.app"
).replace(/\/$/, "");

export const dynamicParams = false;

function getArticle(slug: string): Article | undefined {
  return ARTICLES.find((article) => article.slug === slug);
}

function metaDescription(text: string): string {
  const clean = text.replace(/\s+/g, " ").trim();
  if (clean.length <= 158) return clean;
  return `${clean.slice(0, 155).replace(/\s+\S*$/, "")}…`;
}

function ogImageFor(article: Article) {
  return {
    url: `${siteUrl}/og?title=${encodeURIComponent(
      article.title,
    )}&subtitle=${encodeURIComponent(
      `${article.readMinutes} min read · ${article.category}`,
    )}`,
    width: 1200,
    height: 630,
  };
}

export function generateStaticParams(): { slug: string }[] {
  return ARTICLES.map((article) => ({ slug: article.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const article = getArticle(slug);
  if (!article) return { title: "Article not found" };

  const description = metaDescription(article.dek);
  const ogImage = ogImageFor(article);
  return {
    title: `${article.title} — Article`,
    description,
    alternates: {
      canonical: `/articles/${article.slug}`,
    },
    openGraph: {
      title: `${article.title} — Article — DeepForge`,
      description,
      url: `/articles/${article.slug}`,
      type: "article",
      siteName: "DeepForge",
      images: [ogImage],
    },
    twitter: {
      card: "summary_large_image",
      images: [ogImage],
    },
  };
}

export default async function ArticlePage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const article = getArticle(slug);
  if (!article) notFound();

  const index = ARTICLES.findIndex((entry) => entry.id === article.id);
  const prev = index > 0 ? ARTICLES[index - 1] : null;
  const next =
    index >= 0 && index < ARTICLES.length - 1 ? ARTICLES[index + 1] : null;

  const url = `${siteUrl}/articles/${article.slug}`;
  const description = metaDescription(article.dek);
  const ogImage = ogImageFor(article);

  const jsonLd = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "Article",
        "@id": `${url}#article`,
        headline: article.title,
        description,
        url,
        mainEntityOfPage: url,
        articleSection: article.category,
        inLanguage: "en",
        keywords: article.category,
        publisher: {
          "@type": "Organization",
          name: "DeepForge",
          url: siteUrl,
        },
        image: ogImage.url,
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
            name: "Articles",
            item: `${siteUrl}/articles`,
          },
          {
            "@type": "ListItem",
            position: 3,
            name: article.title,
            item: url,
          },
        ],
      },
    ],
  };

  return (
    <PageShell>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(jsonLd).replace(/</g, "\\u003c"),
        }}
      />

      <div className="mx-auto w-full max-w-6xl px-4 py-10 sm:px-6 sm:py-14">
        <ArticleDetail article={article} prev={prev} next={next} />
      </div>
    </PageShell>
  );
}
