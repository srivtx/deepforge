import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { PageShell } from "@/components/PageShell";
import { PREMADE_COLLECTIONS } from "@/data/collections";
import { PROBLEM_META, type ProblemMeta } from "@/data/problems/problem-meta";
import { CollectionDetail } from "./CollectionDetail";

const siteUrl = (
  process.env.NEXT_PUBLIC_SITE_URL ?? "https://deepforge.app"
).replace(/\/$/, "");

const META_BY_ID = new Map(PROBLEM_META.map((problem) => [problem.id, problem]));

export const dynamicParams = false;

function getCollection(id: string) {
  return PREMADE_COLLECTIONS.find((collection) => collection.id === id);
}

export function generateStaticParams(): { slug: string }[] {
  return PREMADE_COLLECTIONS.map((collection) => ({ slug: collection.id }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const collection = getCollection(slug);
  if (!collection) return { title: "Collection not found" };

  const description = collection.description;
  const ogImage = {
    url: `${siteUrl}/og?title=${encodeURIComponent(
      collection.name,
    )}&subtitle=${encodeURIComponent(
      `${collection.problemIds.length} problems · Collection`,
    )}`,
    width: 1200,
    height: 630,
  };
  return {
    title: `${collection.name} — Collection`,
    description,
    alternates: {
      canonical: `/collections/${collection.id}`,
    },
    openGraph: {
      title: `${collection.name} — Collection — DeepForge`,
      description,
      url: `/collections/${collection.id}`,
      type: "website",
      siteName: "DeepForge",
      images: [ogImage],
    },
    twitter: {
      card: "summary_large_image",
      images: [ogImage],
    },
  };
}

export default async function CollectionPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const collection = getCollection(slug);
  if (!collection) notFound();

  const problems = collection.problemIds
    .map((id) => META_BY_ID.get(id))
    .filter((problem): problem is ProblemMeta => Boolean(problem));
  const url = `${siteUrl}/collections/${collection.id}`;

  const jsonLd = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "ItemList",
        "@id": `${url}#list`,
        name: `${collection.name} — DeepForge collection`,
        description: collection.description,
        numberOfItems: collection.problemIds.length,
        itemListElement: collection.problemIds.map((id, index) => {
          const problem = META_BY_ID.get(id);
          return {
            "@type": "ListItem",
            position: index + 1,
            name: problem?.title ?? id,
            url: `${siteUrl}/problems/${id}`,
          };
        }),
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
            name: "Collections",
            item: `${siteUrl}/collections`,
          },
          {
            "@type": "ListItem",
            position: 3,
            name: collection.name,
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

      <div className="mx-auto flex w-full max-w-6xl flex-col gap-8 px-4 py-10 sm:px-6 sm:py-14">
        <CollectionDetail collection={collection} problems={problems} />

        <footer className="border-t border-hairline pt-4 text-xs text-body-mid">
          <Link
            href="/collections"
            className="rounded-sm transition-colors hover:text-ink focus:outline-none focus-visible:ring-1 focus-visible:ring-accent/40"
          >
            All collections
          </Link>
          <span aria-hidden className="px-2 text-mute">
            ·
          </span>
          <Link
            href="/"
            className="rounded-sm transition-colors hover:text-ink focus:outline-none focus-visible:ring-1 focus-visible:ring-accent/40"
          >
            DeepForge home
          </Link>
        </footer>
      </div>
    </PageShell>
  );
}
