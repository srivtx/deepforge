"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

/**
 * Legacy `/?p=<id>` deep links: the home page used to open a problem overlay.
 * Problems now live at their own route, so replace the URL and navigate there.
 */
export function DeepLink() {
  const router = useRouter();

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const id = params.get("p");
    if (!id) return;
    router.replace(`/problems/${encodeURIComponent(id)}`);
  }, [router]);

  return null;
}
