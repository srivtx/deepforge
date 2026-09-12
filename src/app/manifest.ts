import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "DeepForge — Forge your ML skills",
    short_name: "DeepForge",
    description:
      "2,400+ ML problems across 15 categories with real Python execution in your browser via Pyodide. No account needed, free and MIT-licensed.",
    start_url: "/",
    display: "standalone",
    background_color: "#0a0a0a",
    theme_color: "#0a0a0a",
  };
}
