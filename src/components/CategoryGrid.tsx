"use client";

import { useRouter } from "next/navigation";
import { Reveal } from "@/components/motion/Reveal";
import type { Category, CategoryMeta } from "@/types/problem";
import { categorySlug } from "@/lib/sections";

interface CategoryGridProps {
  categories: CategoryMeta[];
  counts?: Partial<Record<Category, number>>;
  activeCategory: Category | "All";
  onSelect: (c: Category | "All") => void;
}

export function CategoryGrid({
  categories,
  counts,
  activeCategory,
  onSelect,
}: CategoryGridProps) {
  const router = useRouter();

  return (
    <section className="mx-auto max-w-6xl px-4 py-12 sm:px-6 sm:py-16">
      <div className="mb-8 flex items-end justify-between">
        <div>
          <h2 className="text-2xl font-semibold tracking-tight text-ink sm:text-3xl">
            Categories
          </h2>
          <p className="mt-1 text-sm text-body-mid">
            Eight pillars. Pick one and start at the top.
          </p>
        </div>
        <button
          onClick={() => {
            onSelect("All");
            router.push("/problems");
          }}
          className={`rounded-md border px-3 py-1.5 text-xs transition-colors ${
            activeCategory === "All"
              ? "border-accent/40 bg-accent/5 text-accent"
              : "border-hairline text-body-mid hover:bg-canvas-soft hover:text-ink"
          }`}
        >
          View all
        </button>
      </div>
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {categories.map((c, index) => {
          const count = counts?.[c.name];
          const isActive = activeCategory === c.name;
          return (
            <Reveal
              key={c.name}
              delay={Math.min(index, 8) * 60}
              className="h-full"
            >
              <button
                onClick={() => {
                  const next = isActive ? "All" : c.name;
                  onSelect(next);
                  router.push(
                    next === "All"
                      ? "/problems"
                      : `/problems?category=${categorySlug(next)}`,
                  );
                }}
                className={`df-lift group flex h-full flex-col items-start gap-2 rounded-lg border p-4 text-left transition duration-200 ease-out hover:-translate-y-0.5 ${
                  isActive
                    ? "border-accent/50 bg-accent/5"
                    : "border-hairline bg-canvas-card hover:border-accent/40 hover:bg-canvas-soft"
                }`}
              >
                <div className="flex w-full items-center justify-between">
                  <span className="text-sm font-medium text-ink">{c.name}</span>
                  {count !== undefined && (
                    <span className="font-mono text-xs text-body-mid">
                      {count}
                    </span>
                  )}
                </div>
                <p className="text-xs leading-relaxed text-body-mid">
                  {c.blurb}
                </p>
              </button>
            </Reveal>
          );
        })}
      </div>
    </section>
  );
}
