"use client";

import {
  SECTION_GROUPS,
  SECTIONS_BY_GROUP,
  openSection,
  type SectionId,
} from "@/lib/sections";

interface SectionHubProps {
  counts?: Partial<Record<SectionId, number>>;
  onOpen?: (id: SectionId) => void;
}

function SectionIcon({ d }: { d: string }) {
  return (
    <svg
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.75"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
    >
      <path d={d} />
    </svg>
  );
}

export function SectionHub({ counts, onOpen }: SectionHubProps) {
  const handleOpen = (id: SectionId) => {
    if (onOpen) {
      onOpen(id);
      return;
    }
    openSection(id);
  };

  return (
    <section id="hub" className="mx-auto max-w-6xl px-4 py-12 sm:px-6 sm:py-16">
      <div className="mb-8">
        <h2 className="text-2xl font-semibold tracking-tight text-ink sm:text-3xl">
          Explore
        </h2>
        <p className="mt-1 text-sm text-body-mid">
          Everything in DeepForge, in one place. Pick a card to open it.
        </p>
      </div>
      <div className="flex flex-col gap-10">
        {SECTION_GROUPS.map((group) => (
          <div key={group}>
            <h3 className="mb-3 text-sm font-medium text-body-mid">{group}</h3>
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {SECTIONS_BY_GROUP[group].map((section) => {
                const count = counts?.[section.id];
                return (
                  <button
                    key={section.id}
                    type="button"
                    onClick={() => handleOpen(section.id)}
                    className="group flex flex-col items-start gap-3 rounded-lg border border-hairline bg-canvas-card p-4 text-left transition-colors hover:bg-canvas-soft focus:outline-none focus-visible:ring-1 focus-visible:ring-accent/40"
                  >
                    <span className="flex h-8 w-8 items-center justify-center rounded-md border border-hairline text-body-mid transition-colors group-hover:border-accent/40 group-hover:text-accent">
                      <SectionIcon d={section.icon} />
                    </span>
                    <span className="flex w-full items-baseline justify-between gap-2">
                      <span className="text-sm font-medium text-ink">
                        {section.title}
                      </span>
                      {count !== undefined && (
                        <span className="font-mono text-xs text-body-mid">
                          {count.toLocaleString()}+
                        </span>
                      )}
                    </span>
                    <span className="text-xs leading-relaxed text-body-mid">
                      {section.blurb}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
