"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Reveal } from "@/components/motion/Reveal";
import { ThemeToggle } from "@/components/ThemeToggle";
import { SECTION_GROUPS, SECTIONS_BY_GROUP } from "@/lib/sections";

const FOOTER_LINK_CLASS =
  "rounded-sm text-xs text-body-mid transition-colors hover:text-ink focus:outline-none focus-visible:ring-1 focus-visible:ring-accent/40";

function BackToTop({ onHome }: { onHome: boolean }) {
  if (onHome) {
    return (
      <button
        type="button"
        onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
        className={FOOTER_LINK_CLASS}
      >
        Back to top
      </button>
    );
  }
  return (
    <Link href="/#top" className={FOOTER_LINK_CLASS}>
      Back to top
    </Link>
  );
}

export function Footer() {
  const pathname = usePathname();
  const onHome = pathname === "/";

  return (
    <footer className="relative mt-auto border-t border-hairline">
      <div
        aria-hidden
        className="df-footer-edge pointer-events-none absolute inset-x-0 -top-px h-px"
      />
      <Reveal className="mx-auto w-full max-w-6xl px-4 py-8 sm:px-6 sm:py-12">
        <div className="flex flex-col gap-8 lg:flex-row lg:justify-between lg:gap-12">
          <div className="max-w-xs">
            <Link
              href="/"
              onClick={() => {
                if (onHome) window.scrollTo({ top: 0, behavior: "smooth" });
              }}
              aria-label="DeepForge home"
              className="rounded-md text-sm font-semibold tracking-tight text-ink focus:outline-none focus-visible:ring-1 focus-visible:ring-accent/40"
            >
              DeepForge
            </Link>
            <p className="mt-2 text-xs leading-relaxed text-body-mid">
              Practice ML, math, and engineering from scratch — real Python in
              the browser, progress saved locally. No account needed.
            </p>
          </div>

          <div className="grid grid-cols-2 gap-x-6 gap-y-8 sm:grid-cols-3 lg:grid-cols-5">
            {SECTION_GROUPS.map((group) => (
              <nav key={group} aria-label={`${group} sections`}>
                <p className="text-xs font-medium text-ink">{group}</p>
                <ul className="mt-2 flex flex-col gap-1.5">
                  {SECTIONS_BY_GROUP[group].map((section) => (
                    <li key={section.id}>
                      <Link href={section.href} className={FOOTER_LINK_CLASS}>
                        {section.title}
                      </Link>
                    </li>
                  ))}
                </ul>
              </nav>
            ))}
          </div>
        </div>

        <div className="mt-8 flex flex-col items-start justify-between gap-3 border-t border-hairline pt-4 text-xs text-body-mid sm:flex-row sm:items-center">
          <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
            <span>© 2026 DeepForge</span>
            <span className="text-mute">·</span>
            <span>by svx</span>
            <span className="text-mute">·</span>
            <a
              href="https://github.com/srivtx/deepforge"
              target="_blank"
              rel="noopener noreferrer"
              className={FOOTER_LINK_CLASS}
            >
              GitHub
            </a>
            <span className="text-mute">·</span>
            <Link href="/blog" className={FOOTER_LINK_CLASS}>
              Engineering blog
            </Link>
          </div>
          <div className="flex items-center gap-3">
            <ThemeToggle />
            <BackToTop onHome={onHome} />
          </div>
        </div>
      </Reveal>
    </footer>
  );
}
