"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { Header } from "@/components/Header";
import { Hero } from "@/components/Hero";
import { StatsStrip } from "@/components/StatsStrip";
import { CategoryGrid } from "@/components/CategoryGrid";
import { ProblemList } from "@/components/ProblemList";
import { Paths } from "@/components/Paths";
import { Projects } from "@/components/Projects";
import { Labs } from "@/components/Labs";
import { Contests } from "@/components/Contests";
import { Research } from "@/components/Research";
import { Leaderboard } from "@/components/Leaderboard";
import { Badges } from "@/components/Badges";
import { Certificates } from "@/components/Certificates";
import { StatsDashboard } from "@/components/StatsDashboard";
import { Collections } from "@/components/Collections";
import { Playlists } from "@/components/Playlists";
import { InterviewPrep } from "@/components/InterviewPrep";
import { PenPaper } from "@/components/PenPaper";
import { Articles } from "@/components/Articles";
import { Sims } from "@/components/Sims";
import { Speedrun } from "@/components/Speedrun";
import { DeepLink } from "@/components/DeepLink";
import { DailyChallenge } from "@/components/DailyChallenge";
import { Discuss } from "@/components/Discuss";
import { SubmitProblem } from "@/components/SubmitProblem";
import { Playground } from "@/components/Playground";
import { CommandPalette } from "@/components/CommandPalette";
import { ZeroAssistant } from "@/components/ZeroAssistant";
import { ProgressBackup } from "@/components/ProgressBackup";
import { About } from "@/components/About";
import { Footer } from "@/components/Footer";
import { ProblemView } from "@/components/ProblemView";
import {
  PROBLEMS,
  LEARNING_PATHS,
  CATEGORIES,
  getCategoryCounts,
} from "@/data/problems";
import type { Problem, Difficulty } from "@/types/problem";
import { getProgress, type ProgressMap } from "@/lib/progress";
import { MARKETING_PROBLEM_COUNT } from "@/lib/utils";

export default function Page() {
  const [selected, setSelected] = useState<Problem | null>(null);
  const [activeCategory, setActiveCategory] = useState<string>("All");
  const [activeDifficulty, setActiveDifficulty] = useState<
    Difficulty | "All"
  >("All");
  const [search, setSearch] = useState("");
  // Lazy initial read of localStorage — runs once on first client render.
  const [progress, setProgress] = useState<ProgressMap>(() => getProgress());

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

  // Deep-link support: /?category=<name> filters the problem list.
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const category = params.get("category");
    if (category && CATEGORIES.some((c) => c.name === category)) {
      setActiveCategory(category);
      requestAnimationFrame(() => {
        document
          .getElementById("problems")
          ?.scrollIntoView({ behavior: "smooth", block: "start" });
      });
    }
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

  // When the user clicks a category card, scroll to the problem list.
  const handleCategorySelect = (c: string) => {
    setActiveCategory(c === activeCategory ? "All" : c);
    requestAnimationFrame(() => {
      document
        .getElementById("problems")
        ?.scrollIntoView({ behavior: "smooth", block: "start" });
    });
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
          activeCategory={activeCategory as any}
          onSelect={handleCategorySelect}
        />
        <DailyChallenge />
        <ProblemList
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
        />
        <Paths
          paths={LEARNING_PATHS}
          problems={PROBLEMS}
          progress={progress}
        />
        <Projects />
        <Labs />
        <Contests />
        <Speedrun />
        <Research />
        <Leaderboard />
        <Badges />
        <StatsDashboard />
        <Certificates />
        <ProgressBackup />
        <Collections />
        <Playlists />
        <InterviewPrep />
        <PenPaper />
        <Articles />
        <Sims />
        <Discuss />
        <SubmitProblem />
        <Playground />
        <About />
      </main>
      <Footer />
      {selected && (
        <ProblemView
          problem={selected}
          onClose={() => setSelected(null)}
          onProgressChange={handleProgressChange}
        />
      )}
      <CommandPalette />
      <ZeroAssistant />
      <DeepLink />
    </div>
  );
}
