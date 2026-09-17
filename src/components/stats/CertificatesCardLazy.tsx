"use client";

import dynamic from "next/dynamic";

/**
 * Lazy mount point for the certificates card: the certificates graph is
 * heavy (paths, collections, categories, labs, projects, interviews,
 * research), so it only loads after hydration and never enters the /stats
 * first-load bundle.
 */
export const CertificatesCard = dynamic(
  () =>
    import("./CertificatesCard").then((mod) => ({
      default: mod.CertificatesCard,
    })),
  { ssr: false, loading: () => null },
);
