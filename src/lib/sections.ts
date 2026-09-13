export type SectionId =
  | "daily"
  | "problems"
  | "paths"
  | "projects"
  | "labs"
  | "contests"
  | "speedrun"
  | "research"
  | "leaderboard"
  | "badges"
  | "stats"
  | "certificates"
  | "backup"
  | "collections"
  | "playlists"
  | "interview"
  | "penpaper"
  | "articles"
  | "sims"
  | "discuss"
  | "submit"
  | "playground"
  | "about";

export type SectionGroup =
  | "Learn"
  | "Practice"
  | "Compete"
  | "You"
  | "Community";

export interface SectionMeta {
  id: SectionId;
  href: string;
  title: string;
  blurb: string;
  group: SectionGroup;
  icon: string;
  keywords: string[];
}

export const SECTION_GROUPS: SectionGroup[] = [
  "Learn",
  "Practice",
  "Compete",
  "You",
  "Community",
];

const SECTION_LIST: SectionMeta[] = [
  {
    id: "daily",
    href: "/daily",
    title: "Daily Challenge",
    blurb:
      "One problem picked for everyone each day. Solve it to keep your streak alive.",
    group: "Practice",
    icon: "M8 2v4M16 2v4M3 10h18M5 4h14a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2zM9 16l2 2 4-4",
    keywords: ["daily", "challenge", "streak", "today"],
  },
  {
    id: "problems",
    href: "/problems",
    title: "Problems",
    blurb:
      "Browse the full bank by category and difficulty, then solve in the browser.",
    group: "Learn",
    icon: "M4 6h.01M4 12h.01M4 18h.01M9 6h11M9 12h11M9 18h11",
    keywords: ["problems", "problem", "practice", "catalog", "editor"],
  },
  {
    id: "paths",
    href: "/paths",
    title: "Learning Paths",
    blurb:
      "Ordered sequences that take you from zero to a working ML primitive.",
    group: "Learn",
    icon: "M6 22a3 3 0 1 0 0-6 3 3 0 0 0 0 6zM9 19h8.5a3.5 3.5 0 0 0 0-7h-11a3.5 3.5 0 0 1 0-7H15M18 8a3 3 0 1 0 0-6 3 3 0 0 0 0 6z",
    keywords: ["paths", "path", "learning", "curriculum"],
  },
  {
    id: "projects",
    href: "/projects",
    title: "Projects",
    blurb:
      "Multi-step labs that build a working system one problem at a time.",
    group: "Learn",
    icon: "M20 20a2 2 0 0 0 2-2V8a2 2 0 0 0-2-2h-7.9a2 2 0 0 1-1.69-.9L9.6 3.9A2 2 0 0 0 7.93 3H4a2 2 0 0 0-2 2v13a2 2 0 0 0 2 2Z",
    keywords: ["projects", "project", "build", "system"],
  },
  {
    id: "labs",
    href: "/labs",
    title: "Labs",
    blurb: "Dataset-driven challenges scored against a held-out benchmark.",
    group: "Practice",
    icon: "M14 2v6a2 2 0 0 0 .245.96l5.51 10.08A2 2 0 0 1 18 22H6a2 2 0 0 1-1.755-2.96l5.51-10.08A2 2 0 0 0 10 8V2M6.453 15h11.094M8.5 2h7",
    keywords: ["labs", "lab", "datasets", "benchmark"],
  },
  {
    id: "contests",
    href: "/contests",
    title: "Contests",
    blurb: "Timed problem sets with a countdown and a saved best score.",
    group: "Compete",
    icon: "M6 9H4.5a2.5 2.5 0 0 1 0-5H6M18 9h1.5a2.5 2.5 0 0 0 0-5H18M4 22h16M10 14.66V17c0 .55-.47.98-.97 1.21C7.85 18.75 7 20.24 7 22M14 14.66V17c0 .55.47.98.97 1.21C16.15 18.75 17 20.24 17 22M18 2H6v7a6 6 0 0 0 12 0V2Z",
    keywords: ["contests", "contest", "timed", "competition"],
  },
  {
    id: "speedrun",
    href: "/speedrun",
    title: "Speedrun",
    blurb: "A seeded solve-a-thon against the clock and your own ghost.",
    group: "Compete",
    icon: "M10 2h4M12 14l3-3M12 6a8 8 0 1 0 0 16 8 8 0 0 0 0-16z",
    keywords: ["speedrun", "race", "seeded", "ghost"],
  },
  {
    id: "research",
    href: "/research",
    title: "Research",
    blurb: "Beat a baseline model and your code becomes the latest best.",
    group: "Practice",
    icon: "M11 3a8 8 0 1 0 0 16 8 8 0 0 0 0-16zM21 21l-4.35-4.35M8 12h2l1.5-3 2 6 1.5-3h2",
    keywords: ["research", "baseline", "paper", "sota"],
  },
  {
    id: "leaderboard",
    href: "/leaderboard",
    title: "Leaderboard",
    blurb: "Flame Score, streaks, and your rank among local solvers.",
    group: "Compete",
    icon: "M3 3v18h18M18 17V9M13 17V5M8 17v-3",
    keywords: ["leaderboard", "flame", "ranking", "rank"],
  },
  {
    id: "badges",
    href: "/badges",
    title: "Badges",
    blurb: "Level, quests, and the badges you unlock from progress.",
    group: "You",
    icon: "M12 14a6 6 0 1 0 0-12 6 6 0 0 0 0 12zM15.477 12.89L17 22l-5-3-5 3 1.523-9.11",
    keywords: ["badges", "badge", "profile", "level", "quests"],
  },
  {
    id: "stats",
    href: "/stats",
    title: "Stats",
    blurb: "Solved counts, accuracy, streaks, and an estimated mastery score.",
    group: "You",
    icon: "M16 7h6v6M22 7l-8.5 8.5-5-5L2 17",
    keywords: ["stats", "statistics", "dashboard", "mastery"],
  },
  {
    id: "certificates",
    href: "/certificates",
    title: "Certificates",
    blurb:
      "Claim printable certificates for paths, collections, and categories.",
    group: "You",
    icon: "M8 3h8l4 4v14H8a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2zM16 3v4h4M10 13h6M10 17h4",
    keywords: ["certificates", "certificate", "award", "print"],
  },
  {
    id: "backup",
    href: "/backup",
    title: "Backup",
    blurb: "Export a backup of your data or move it to another device.",
    group: "You",
    icon: "M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4M17 8l-5-5-5 5M12 3v12",
    keywords: ["backup", "export", "import", "data"],
  },
  {
    id: "collections",
    href: "/collections",
    title: "Collections",
    blurb: "Curated sets and your own problem collections.",
    group: "You",
    icon: "M12 2 2 7l10 5 10-5zM2 12l10 5 10-5M2 17l10 5 10-5",
    keywords: ["collections", "collection", "sets", "curated"],
  },
  {
    id: "playlists",
    href: "/playlists",
    title: "Playlists",
    blurb: "Build, reorder, and share ordered sets of problems.",
    group: "You",
    icon: "M4 6h10M4 12h10M4 18h6M15 12v8l6-4z",
    keywords: ["playlists", "playlist", "queue", "share"],
  },
  {
    id: "interview",
    href: "/interview",
    title: "Interview Prep",
    blurb: "Company-style tracks and timed mocks from warm-up to hard.",
    group: "Learn",
    icon: "M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2zM8 9h8M8 13h5",
    keywords: ["interview", "prep", "mock", "company"],
  },
  {
    id: "penpaper",
    href: "/math",
    title: "Pen & Paper",
    blurb: "No-code math problems answered by hand, with worked explanations.",
    group: "Learn",
    icon: "M21.174 6.812a1 1 0 0 0-3.986-3.987L3.842 16.174a2 2 0 0 0-.5.83l-1.321 4.352a.5.5 0 0 0 .623.622l4.353-1.32a2 2 0 0 0 .83-.497zM15 5l4 4",
    keywords: ["penpaper", "pen", "paper", "math", "no-code"],
  },
  {
    id: "articles",
    href: "/articles",
    title: "Articles",
    blurb: "Interactive lessons with live demos that run in the page.",
    group: "Learn",
    icon: "M15 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7zM14 2v4a2 2 0 0 0 2 2h4M10 9H8M16 13H8M16 17H8",
    keywords: ["articles", "article", "lessons", "interactive"],
  },
  {
    id: "sims",
    href: "/sims",
    title: "Sims",
    blurb: "Live simulations you can play, pause, and step through.",
    group: "Practice",
    icon: "M21 4h-7M10 4H3M21 12h-9M8 12H3M21 20h-5M12 20H3M14 2v4M8 10v4M16 18v4",
    keywords: ["sims", "sim", "simulations", "interactive"],
  },
  {
    id: "discuss",
    href: "/discuss",
    title: "Discuss",
    blurb: "Ask questions and read threads from other solvers.",
    group: "Community",
    icon: "M7.9 20A9 9 0 1 0 4 16.1L2 22z",
    keywords: ["discuss", "forum", "threads", "community"],
  },
  {
    id: "submit",
    href: "/submit",
    title: "Submit a Problem",
    blurb: "Author a problem, validate it locally, and export the snippet.",
    group: "Community",
    icon: "M12 2a10 10 0 1 0 0 20 10 10 0 0 0 0-20zM8 12h8M12 8v8",
    keywords: ["submit", "submit-problem", "author", "draft"],
  },
  {
    id: "playground",
    href: "/playground",
    title: "Playground",
    blurb: "A scratch pad that runs Python locally via Pyodide.",
    group: "Practice",
    icon: "M5 3h14a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2zM7 11l2-2-2-2M11 13h4",
    keywords: ["playground", "python", "scratch", "sandbox"],
  },
  {
    id: "about",
    href: "/about",
    title: "About",
    blurb: "What DeepForge is, who built it, and why.",
    group: "Community",
    icon: "M12 2a10 10 0 1 0 0 20 10 10 0 0 0 0-20zM12 16v-4M12 8h.01",
    keywords: ["about", "meta", "info"],
  },
];

export const SECTIONS: SectionMeta[] = SECTION_LIST;

export const SECTIONS_BY_ID = SECTION_LIST.reduce<Record<string, SectionMeta>>(
  (acc, section) => {
    acc[section.id] = section;
    return acc;
  },
  {},
) as Record<SectionId, SectionMeta>;

export const SECTIONS_BY_GROUP = SECTION_GROUPS.reduce<
  Record<SectionGroup, SectionMeta[]>
>(
  (acc, group) => {
    acc[group] = SECTION_LIST.filter((section) => section.group === group);
    return acc;
  },
  { Learn: [], Practice: [], Compete: [], You: [], Community: [] },
);

export function getSectionById(id: string): SectionMeta | undefined {
  if (!Object.prototype.hasOwnProperty.call(SECTIONS_BY_ID, id)) {
    return undefined;
  }
  return SECTIONS_BY_ID[id as SectionId];
}

export function findSectionByHash(hash: string): SectionMeta | undefined {
  const key = hash.replace(/^#/, "").trim().toLowerCase();
  if (!key) return undefined;
  const byId = getSectionById(key);
  if (byId) return byId;
  return SECTION_LIST.find((section) =>
    section.keywords.some((keyword) => keyword.toLowerCase() === key),
  );
}

/**
 * Convert a category name to the slug used by /problems?category= and
 * /categories/[slug] (lowercase, non-alphanumerics collapsed to dashes).
 */
export function categorySlug(name: string): string {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}
