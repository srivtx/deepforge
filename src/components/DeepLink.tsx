"use client";

import { useEffect } from "react";
import { PROBLEMS } from "@/data/problems";

export function DeepLink() {
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const id = params.get("p");
    if (!id) return;

    const problem = PROBLEMS.find((candidate) => candidate.id === id);
    if (!problem) return;

    const open = window.setTimeout(() => {
      window.dispatchEvent(
        new CustomEvent("deepforge:open-problem", { detail: { id } }),
      );

      const url = new URL(window.location.href);
      url.searchParams.delete("p");
      window.history.replaceState(
        null,
        "",
        `${url.pathname}${url.search}${url.hash}`,
      );
    }, 0);

    return () => window.clearTimeout(open);
  }, []);

  return null;
}
