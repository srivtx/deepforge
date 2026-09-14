import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    id: "/",
    name: "DeepForge — Forge your ML skills",
    short_name: "DeepForge",
    description:
      "5,550+ ML problems across 15 categories with real Python execution in your browser via Pyodide. No account needed, free and MIT-licensed.",
    start_url: "/",
    scope: "/",
    lang: "en",
    display: "standalone",
    background_color: "#0a0a0a",
    theme_color: "#0a0a0a",
    categories: ["education"],
    icons: [
      {
        src: "/icons/icon.svg",
        sizes: "any",
        type: "image/svg+xml",
        purpose: "any",
      },
      {
        src: "/icons/maskable.svg",
        sizes: "any",
        type: "image/svg+xml",
        purpose: "maskable",
      },
    ],
    shortcuts: [
      {
        name: "Problems",
        short_name: "Problems",
        description: "Browse 5,550+ ML problems by category",
        url: "/#problems",
      },
      {
        name: "Daily Challenge",
        short_name: "Daily",
        description: "Today's featured ML problem",
        url: "/#daily",
      },
      {
        name: "Playground",
        short_name: "Playground",
        description: "Run Python in your browser with Pyodide",
        url: "/#playground",
      },
      {
        name: "Labs",
        short_name: "Labs",
        description: "Interactive ML experiments and visualizations",
        url: "/#labs",
      },
    ],
  };
}
