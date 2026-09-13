"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import dynamic from "next/dynamic";
import { Header } from "@/components/Header";
import { Hero } from "@/components/Hero";
import { StatsStrip } from "@/components/StatsStrip";
import { CategoryGrid } from "@/components/CategoryGrid";
import { SectionHub } from "@/components/SectionHub";
import { SectionModal } from "@/components/SectionModal";
import { Footer } from "@/components/Footer";
import { ProblemView } from "@/components/ProblemView";
import { CommandPalette } from "@/components/CommandPalette";
import { ZeroAssistant } from "@/components/ZeroAssistant";
import { DeepLink } from "@/components/DeepLink";
import {
  OPEN_SECTION_EVENT,
  SECTIONS_BY_ID,
  findSectionByHash,
  getSectionById,
  type SectionId,
} from "@/lib/sections";
import {
  PROBLEMS,
  LEARNING_PATHS,
  CATEGORIES,
  getCategoryCounts,
} from "@/data/problems";
import type { Category, Problem, Difficulty } from "@/types/problem";
import { getProgress, type ProgressMap } from "@/lib/progress";
import { MARKETING_PROBLEM_COUNT } from "@/lib/utils";

function SectionLoading() {
  return (
    <div
      role="status"
      className="flex items-center justify-center gap-2 px-6 py-16 text-sm text-body-mid"
    >
      <span className="df-spin inline-block h-3.5 w-3.5 rounded-full border-2 border-hairline border-t-accent" />
      Loading…
    </div>
  );
}

const LazyDaily = dynamic(
  () => import("@/components/DailyChallenge").then((m) => m.DailyChallenge),
  { ssr: false, loading: SectionLoading },
);

type ProblemsModalProps = {
  problems: Problem[];
  progress: ProgressMap;
  activeCategory: string;
  activeDifficulty: Difficulty | "All";
  search: string;
  onCategoryChange: (category: string) => void;
  onDifficultyChange: (difficulty: Difficulty | "All") => void;
  onSearchChange: (value: string) => void;
  onOpen: (problem: Problem) => void;
  categories: string[];
  initialCategory?: string;
};

const LazyProblems = dynamic<ProblemsModalProps>(
  () => import("@/components/ProblemList").then((m) => m.ProblemList),
  { ssr: false, loading: SectionLoading },
);

type PathsModalProps = {
  paths: typeof LEARNING_PATHS;
  problems: Problem[];
  progress: ProgressMap;
};

const LazyPaths = dynamic<PathsModalProps>(
  () => import("@/components/Paths").then((m) => m.Paths),
  { ssr: false, loading: SectionLoading },
);

const LazyProjects = dynamic(
  () => import("@/components/Projects").then((m) => m.Projects),
  { ssr: false, loading: SectionLoading },
);

const LazyLabs = dynamic(
  () => import("@/components/Labs").then((m) => m.Labs),
  { ssr: false, loading: SectionLoading },
);

const LazyContests = dynamic(
  () => import("@/components/Contests").then((m) => m.Contests),
  { ssr: false, loading: SectionLoading },
);

const LazySpeedrun = dynamic(
  () => import("@/components/Speedrun").then((m) => m.Speedrun),
  { ssr: false, loading: SectionLoading },
);

const LazyResearch = dynamic(
  () => import("@/components/Research").then((m) => m.Research),
  { ssr: false, loading: SectionLoading },
);

const LazyLeaderboard = dynamic(
  () => import("@/components/Leaderboard").then((m) => m.Leaderboard),
  { ssr: false, loading: SectionLoading },
);

const LazyBadges = dynamic(
  () => import("@/components/Badges").then((m) => m.Badges),
  { ssr: false, loading: SectionLoading },
);

const LazyStats = dynamic(
  () => import("@/components/StatsDashboard").then((m) => m.StatsDashboard),
  { ssr: false, loading: SectionLoading },
);

const LazyCertificates = dynamic(
  () => import("@/components/Certificates").then((m) => m.Certificates),
  { ssr: false, loading: SectionLoading },
);

const LazyBackup = dynamic(
  () => import("@/components/ProgressBackup").then((m) => m.ProgressBackup),
  { ssr: false, loading: SectionLoading },
);

const LazyCollections = dynamic(
  () => import("@/components/Collections").then((m) => m.Collections),
  { ssr: false, loading: SectionLoading },
);

const LazyPlaylists = dynamic(
  () => import("@/components/Playlists").then((m) => m.Playlists),
  { ssr: false, loading: SectionLoading },
);

const LazyInterview = dynamic(
  () => import("@/components/InterviewPrep").then((m) => m.InterviewPrep),
  { ssr: false, loading: SectionLoading },
);

const LazyPenPaper = dynamic(
  () => import("@/components/PenPaper").then((m) => m.PenPaper),
  { ssr: false, loading: SectionLoading },
);

const LazyArticles = dynamic(
  () => import("@/components/Articles").then((m) => m.Articles),
  { ssr: false, loading: SectionLoading },
);

const LazySims = dynamic(
  () => import("@/components/Sims").then((m) => m.Sims),
  { ssr: false, loading: SectionLoading },
);

const LazyDiscuss = dynamic(
  () => import("@/components/Discuss").then((m) => m.Discuss),
  { ssr: false, loading: SectionLoading },
);

const LazySubmit = dynamic(
  () => import("@/components/SubmitProblem").then((m) => m.SubmitProblem),
  { ssr: false, loading: SectionLoading },
);

const LazyPlayground = dynamic(
  () => import("@/components/Playground").then((m) => m.Playground),
  { ssr: false, loading: SectionLoading },
);

const LazyAbout = dynamic(
  () => import("@/components/About").then((m) => m.About),
  { ssr: false, loading: SectionLoading },
);

interface ActiveSection {
  id: SectionId;
  params?: Record<string, string>;
}

export default function Page() {
  const [selected, setSelected] = useState<Problem | null>(null);
  const [activeCategory, setActiveCategory] = useState<string>(() => {
    if (typeof window === "undefined") return "All";
    const category = new URLSearchParams(window.location.search).get(
      "category",
    );
    return category && CATEGORIES.some((c) => c.name === category)
      ? category
      : "All";
  });
  const [activeDifficulty, setActiveDifficulty] = useState<
    Difficulty | "All"
  >("All");
  const [search, setSearch] = useState("");
  // Lazy initial read of localStorage — runs once on first client render.
  const [progress, setProgress] = useState<ProgressMap>(() => getProgress());
  const [activeSection, setActiveSection] = useState<ActiveSection | null>(
    null,
  );

  const openSectionModal = useCallback(
    (id: SectionId, params?: Record<string, string>) => {
      if (id === "problems") {
        const category = params?.category;
        setActiveCategory(
          category && CATEGORIES.some((c) => c.name === category)
            ? category
            : "All",
        );
      }
      setActiveSection({ id, params });
    },
    [],
  );

  useEffect(() => {
    const onOpenSection = (e: Event) => {
      const detail = (e as CustomEvent<{ id?: unknown; params?: unknown }>)
        .detail;
      if (!detail || typeof detail.id !== "string") return;
      const section = getSectionById(detail.id);
      if (!section) return;
      const params =
        detail.params && typeof detail.params === "object"
          ? (detail.params as Record<string, string>)
          : undefined;
      openSectionModal(section.id, params);
    };
    window.addEventListener(OPEN_SECTION_EVENT, onOpenSection);
    return () =>
      window.removeEventListener(OPEN_SECTION_EVENT, onOpenSection);
  }, [openSectionModal]);

  useEffect(() => {
    const onHashChange = () => {
      const section = findSectionByHash(window.location.hash);
      if (section) openSectionModal(section.id);
    };
    const initial = requestAnimationFrame(onHashChange);
    window.addEventListener("hashchange", onHashChange);
    return () => {
      cancelAnimationFrame(initial);
      window.removeEventListener("hashchange", onHashChange);
    };
  }, [openSectionModal]);

  // Deep-link support: /?category=<name> opens the problem list preselected.
  useEffect(() => {
    const category = new URLSearchParams(window.location.search).get(
      "category",
    );
    if (!category || !CATEGORIES.some((c) => c.name === category)) return;
    const initial = requestAnimationFrame(() => {
      openSectionModal("problems", { category });
    });
    return () => cancelAnimationFrame(initial);
  }, [openSectionModal]);

  // Subscribe to progress changes (from this tab's writes via the custom
  // event, and from other tabs via the storage event).
  useEffect(() => {
    const onChange = () => setProgress(getProgress());
    window.addEventListener("storage", onChange);
    window.addEventListener("deepforge:progress-change", onChange);
    return () => {
      window.removeEventListener("storage", onChange);
      window.removeEventListener("deepforge:progress-change", onChange);
    };
  }, []);

  const handleProgressChange = useCallback(() => {
    setProgress(getProgress());
  }, []);

  // Allow any section (forum chips, playlists, assistant citations, articles)
  // to open a problem by id.
  useEffect(() => {
    const onOpenProblem = (e: Event) => {
      const id = (e as CustomEvent).detail?.id;
      if (typeof id !== "string") return;
      const p = PROBLEMS.find((x) => x.id === id);
      if (p) setSelected(p);
    };
    window.addEventListener("deepforge:open-problem", onOpenProblem);
    return () =>
      window.removeEventListener("deepforge:open-problem", onOpenProblem);
  }, []);

  const categoryCounts = useMemo(() => getCategoryCounts(), []);
  const stats = useMemo(() => {
    let solved = 0;
    let attempted = 0;
    for (const p of PROBLEMS) {
      const prog = progress[p.id];
      if (prog?.solved) solved += 1;
      if (prog?.attempted) attempted += 1;
    }
    return { solved, attempted, total: PROBLEMS.length };
  }, [progress]);

  const handleCategorySelect = (c: Category | "All") => {
    setActiveCategory(c);
  };

  const renderSection = () => {
    if (!activeSection) return null;
    switch (activeSection.id) {
      case "daily":
        return <LazyDaily />;
      case "problems":
        return (
          <LazyProblems
            problems={PROBLEMS}
            progress={progress}
            activeCategory={activeCategory}
            activeDifficulty={activeDifficulty}
            search={search}
            onCategoryChange={setActiveCategory}
            onDifficultyChange={setActiveDifficulty}
            onSearchChange={setSearch}
            onOpen={setSelected}
            categories={CATEGORIES.map((c) => c.name)}
            initialCategory={
              activeCategory === "All" ? undefined : activeCategory
            }
          />
        );
      case "paths":
        return (
          <LazyPaths
            paths={LEARNING_PATHS}
            problems={PROBLEMS}
            progress={progress}
          />
        );
      case "projects":
        return <LazyProjects />;
      case "labs":
        return <LazyLabs />;
      case "contests":
        return <LazyContests />;
      case "speedrun":
        return <LazySpeedrun />;
      case "research":
        return <LazyResearch />;
      case "leaderboard":
        return <LazyLeaderboard />;
      case "badges":
        return <LazyBadges />;
      case "stats":
        return <LazyStats />;
      case "certificates":
        return <LazyCertificates />;
      case "backup":
        return <LazyBackup />;
      case "collections":
        return <LazyCollections />;
      case "playlists":
        return <LazyPlaylists />;
      case "interview":
        return <LazyInterview />;
      case "penpaper":
        return <LazyPenPaper />;
      case "articles":
        return <LazyArticles />;
      case "sims":
        return <LazySims />;
      case "discuss":
        return <LazyDiscuss />;
      case "submit":
        return <LazySubmit />;
      case "playground":
        return <LazyPlayground />;
      case "about":
        return <LazyAbout />;
      default:
        return null;
    }
  };

  return (
    <div className="flex min-h-screen flex-col">
      <Header solvedCount={stats.solved} totalCount={stats.total} />
      <main className="flex-1">
        <Hero
          problemCount={MARKETING_PROBLEM_COUNT}
          categoryCount={CATEGORIES.length}
        />
        <StatsStrip
          problemCount={MARKETING_PROBLEM_COUNT}
          categoryCount={CATEGORIES.length}
          pathCount={LEARNING_PATHS.length}
        />
        <CategoryGrid
          categories={CATEGORIES}
          counts={categoryCounts}
          activeCategory={activeCategory as Category | "All"}
          onSelect={handleCategorySelect}
        />
        <SectionHub counts={{ problems: MARKETING_PROBLEM_COUNT }} />
      </main>
      <Footer />
      {selected && (
        <ProblemView
          problem={selected}
          onClose={() => setSelected(null)}
          onProgressChange={handleProgressChange}
        />
      )}
      {activeSection && (
        <SectionModal
          title={SECTIONS_BY_ID[activeSection.id].title}
          onClose={() => setActiveSection(null)}
        >
          {renderSection()}
        </SectionModal>
      )}
      <CommandPalette />
      <ZeroAssistant />
      <DeepLink />
    </div>
  );
}
