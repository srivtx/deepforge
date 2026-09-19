"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  useCallback,
  useEffect,
  useRef,
  useState,
  type FocusEvent as ReactFocusEvent,
  type KeyboardEvent as ReactKeyboardEvent,
  type PointerEvent as ReactPointerEvent,
} from "react";
import { SECTIONS_BY_ID } from "@/lib/sections";

export type NavItemId =
  | "today"
  | "review"
  | "daily"
  | "alibi"
  | "ledger"
  | "problems"
  | "paths"
  | "projects"
  | "articles"
  | "papers"
  | "inventions"
  | "keyfuse"
  | "warrant"
  | "reprogpu"
  | "penpaper"
  | "interview"
  | "daily"
  | "labs"
  | "playground"
  | "sims"
  | "research"
  | "contests"
  | "speedrun"
  | "leaderboard"
  | "badges"
  | "stats"
  | "certificates"
  | "collections"
  | "playlists"
  | "backup"
  | "discuss"
  | "submit"
  | "about"
  | "blog";

const NAV_ITEM_LABELS: Record<NavItemId, string> = {
  today: "Today",
  review: "Review",
  daily: "Daily Challenge",
  alibi: "Silent Bug Hunt",
  ledger: "Behavior Ledger",
  problems: "Problems",
  paths: "Paths",
  projects: "Projects",
  articles: "Articles",
  papers: "Papers",
  inventions: "Publications",
  keyfuse: "KeyFuse",
  warrant: "Warrant Lab",
  reprogpu: "REPROGPU",
  penpaper: "Pen & Paper",
  interview: "Interview Prep",
  labs: "Labs",
  playground: "Playground",
  sims: "Sims",
  research: "Research",
  contests: "Contests",
  speedrun: "Speedrun",
  leaderboard: "Leaderboard",
  badges: "Badges",
  stats: "Stats",
  certificates: "Certificates",
  collections: "Collections",
  playlists: "Playlists",
  backup: "Backup",
  discuss: "Discuss",
  submit: "Submit a problem",
  about: "About",
  blog: "Engineering",
};

export interface NavMenuGroup {
  label?: string;
  columns?: 1 | 2;
  items: NavItemId[];
}

export interface NavMenu {
  id: "learn" | "practice" | "compete" | "more";
  label: string;
  groups: NavMenuGroup[];
}

export const NAV_MENUS: NavMenu[] = [
  {
    id: "learn",
    label: "Learn",
    groups: [
      {
        items: ["problems", "paths", "projects", "articles", "papers", "inventions", "keyfuse", "warrant", "reprogpu", "penpaper", "interview"],
      },
    ],
  },
  {
    id: "practice",
    label: "Practice",
    groups: [
      { items: ["today", "review", "daily", "alibi", "ledger", "labs", "playground", "sims", "research"] },
    ],
  },
  {
    id: "compete",
    label: "Compete",
    groups: [{ items: ["contests", "speedrun", "leaderboard"] }],
  },
  {
    id: "more",
    label: "More",
    groups: [
      {
        label: "Progress",
        columns: 2,
        items: ["badges", "stats", "certificates", "collections", "playlists", "backup"],
      },
      {
        label: "Community",
        items: ["discuss", "submit", "about"],
      },
      {
        label: "Writing",
        items: ["blog"],
      },
    ],
  },
];

export const MOBILE_NAV_GROUPS: { label: string; items: NavItemId[] }[] = [
  {
    label: "Learn",
    items: ["problems", "paths", "projects", "articles", "papers", "inventions", "keyfuse", "warrant", "reprogpu", "penpaper", "interview"],
  },
  {
    label: "Practice",
    items: ["today", "review", "daily", "alibi", "ledger", "labs", "playground", "sims", "research"],
  },
  {
    label: "Compete",
    items: ["contests", "speedrun", "leaderboard"],
  },
  {
    label: "You",
    items: ["badges", "stats", "certificates", "collections", "playlists", "backup"],
  },
  {
    label: "Community",
    items: ["discuss", "submit", "about"],
  },
  {
    label: "Writing",
    items: ["blog"],
  },
];

const MENU_ITEM_CLASS =
  "flex w-full items-center whitespace-nowrap rounded-md px-2 py-1.5 text-[13px] text-body-mid transition-colors hover:bg-canvas-soft hover:text-ink focus:bg-canvas-soft focus:text-ink focus:outline-none focus-visible:ring-1 focus-visible:ring-accent/40";

export function NavItemLink({
  id,
  onSelect,
  role,
  className,
}: {
  id: NavItemId;
  onSelect?: () => void;
  role?: "menuitem";
  className?: string;
}) {
  const href = id === "blog" ? "/blog" : SECTIONS_BY_ID[id].href;
  const pathname = usePathname();
  const isCurrent = pathname === href || pathname.startsWith(`${href}/`);
  return (
    <Link
      href={href}
      role={role}
      data-nav-item
      aria-current={isCurrent ? "page" : undefined}
      onClick={() => onSelect?.()}
      className={className}
    >
      {NAV_ITEM_LABELS[id]}
    </Link>
  );
}

function triggerClass(isOpen: boolean) {
  return `flex h-8 items-center gap-1 whitespace-nowrap rounded-md px-2 text-[13px] transition-colors focus:outline-none focus-visible:ring-1 focus-visible:ring-accent/40 ${
    isOpen
      ? "bg-canvas-soft text-ink"
      : "text-body-mid hover:bg-canvas-soft hover:text-ink"
  }`;
}

export function NavMenus() {
  const [open, setOpen] = useState<NavMenu["id"] | null>(null);
  const rootRef = useRef<HTMLDivElement>(null);
  const closeTimerRef = useRef<number | null>(null);
  const wrapperRefs = useRef<
    Partial<Record<NavMenu["id"], HTMLDivElement | null>>
  >({});
  const triggerRefs = useRef<
    Partial<Record<NavMenu["id"], HTMLButtonElement | null>>
  >({});
  const panelRefs = useRef<
    Partial<Record<NavMenu["id"], HTMLDivElement | null>>
  >({});

  const clearCloseTimer = useCallback(() => {
    if (closeTimerRef.current !== null) {
      window.clearTimeout(closeTimerRef.current);
      closeTimerRef.current = null;
    }
  }, []);

  const closeMenu = useCallback(
    (menuId: NavMenu["id"]) => {
      clearCloseTimer();
      setOpen((current) => (current === menuId ? null : current));
    },
    [clearCloseTimer],
  );

  // A tiny close delay keeps a hover-opened panel from flickering when the
  // pointer crosses the gap between two triggers.
  const scheduleClose = useCallback(
    (menuId: NavMenu["id"]) => {
      clearCloseTimer();
      closeTimerRef.current = window.setTimeout(() => {
        closeTimerRef.current = null;
        if (wrapperRefs.current[menuId]?.contains(document.activeElement)) {
          return;
        }
        setOpen((current) => (current === menuId ? null : current));
      }, 120);
    },
    [clearCloseTimer],
  );

  useEffect(() => {
    return () => {
      clearCloseTimer();
    };
  }, [clearCloseTimer]);

  const focusItem = (menuId: NavMenu["id"], edge: "first" | "last") => {
    window.requestAnimationFrame(() => {
      const items = panelRefs.current[menuId]?.querySelectorAll<HTMLElement>(
        "[data-nav-item]",
      );
      if (!items || items.length === 0) return;
      const target = edge === "first" ? items[0] : items[items.length - 1];
      target?.focus();
    });
  };

  // Escape closes the open panel and returns focus to its trigger. A
  // pointerdown outside the menu root also closes it.
  useEffect(() => {
    if (!open) return;
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key !== "Escape") return;
      clearCloseTimer();
      triggerRefs.current[open]?.focus();
      setOpen(null);
    };
    const onPointerDown = (event: PointerEvent) => {
      if (!rootRef.current?.contains(event.target as Node)) {
        clearCloseTimer();
        setOpen(null);
      }
    };
    document.addEventListener("keydown", onKeyDown);
    document.addEventListener("pointerdown", onPointerDown);
    return () => {
      document.removeEventListener("keydown", onKeyDown);
      document.removeEventListener("pointerdown", onPointerDown);
    };
  }, [open, clearCloseTimer]);

  const handleTriggerKeyDown = (
    event: ReactKeyboardEvent<HTMLButtonElement>,
    menuId: NavMenu["id"],
    index: number,
  ) => {
    if (event.key === "ArrowDown" || event.key === "ArrowUp") {
      event.preventDefault();
      clearCloseTimer();
      setOpen(menuId);
      focusItem(menuId, event.key === "ArrowDown" ? "first" : "last");
      return;
    }
    if (event.key === "ArrowRight" || event.key === "ArrowLeft") {
      event.preventDefault();
      const direction = event.key === "ArrowRight" ? 1 : -1;
      const next =
        NAV_MENUS[(index + direction + NAV_MENUS.length) % NAV_MENUS.length];
      triggerRefs.current[next.id]?.focus();
      if (open) setOpen(next.id);
    }
  };

  const handlePanelKeyDown = (
    event: ReactKeyboardEvent<HTMLDivElement>,
    menuId: NavMenu["id"],
  ) => {
    const items = Array.from(
      panelRefs.current[menuId]?.querySelectorAll<HTMLElement>(
        "[data-nav-item]",
      ) ?? [],
    );
    if (items.length === 0) return;
    const current = items.indexOf(document.activeElement as HTMLElement);
    if (event.key === "ArrowDown") {
      event.preventDefault();
      items[(current + 1) % items.length]?.focus();
    } else if (event.key === "ArrowUp") {
      event.preventDefault();
      if (current <= 0) triggerRefs.current[menuId]?.focus();
      else items[current - 1]?.focus();
    } else if (event.key === "Home") {
      event.preventDefault();
      items[0]?.focus();
    } else if (event.key === "End") {
      event.preventDefault();
      items[items.length - 1]?.focus();
    }
  };

  const handleWrapperPointerEnter = (
    event: ReactPointerEvent<HTMLDivElement>,
    menuId: NavMenu["id"],
  ) => {
    if (event.pointerType !== "mouse") return;
    clearCloseTimer();
    setOpen(menuId);
  };

  const handleWrapperPointerLeave = (
    event: ReactPointerEvent<HTMLDivElement>,
    menuId: NavMenu["id"],
  ) => {
    if (event.pointerType !== "mouse") return;
    // Keep a click- or keyboard-opened panel alive while focus stays inside.
    if (event.currentTarget.contains(document.activeElement)) return;
    scheduleClose(menuId);
  };

  const handleWrapperBlur = (
    event: ReactFocusEvent<HTMLDivElement>,
    menuId: NavMenu["id"],
  ) => {
    if (event.currentTarget.contains(event.relatedTarget as Node | null)) return;
    closeMenu(menuId);
  };

  return (
    <div ref={rootRef} className="hidden items-center gap-1 sm:flex">
      {NAV_MENUS.map((menu, index) => {
        const isOpen = open === menu.id;
        return (
          <div
            key={menu.id}
            ref={(element) => {
              wrapperRefs.current[menu.id] = element;
            }}
            className="relative"
            onPointerEnter={(event) =>
              handleWrapperPointerEnter(event, menu.id)
            }
            onPointerLeave={(event) =>
              handleWrapperPointerLeave(event, menu.id)
            }
            onBlur={(event) => handleWrapperBlur(event, menu.id)}
          >
            <button
              ref={(element) => {
                triggerRefs.current[menu.id] = element;
              }}
              type="button"
              id={`nav-trigger-${menu.id}`}
              aria-haspopup="menu"
              aria-expanded={isOpen}
              aria-controls={`nav-panel-${menu.id}`}
              onClick={() => {
                clearCloseTimer();
                setOpen((current) => (current === menu.id ? null : menu.id));
              }}
              onKeyDown={(event) =>
                handleTriggerKeyDown(event, menu.id, index)
              }
              className={triggerClass(isOpen)}
            >
              {menu.label}
              <svg
                width="10"
                height="10"
                viewBox="0 0 16 16"
                fill="none"
                aria-hidden
                className={`shrink-0 transition-transform ${
                  isOpen ? "rotate-180" : ""
                }`}
              >
                <path
                  d="M4 6l4 4 4-4"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </button>
            {isOpen && (
              <div
                ref={(element) => {
                  panelRefs.current[menu.id] = element;
                }}
                id={`nav-panel-${menu.id}`}
                role="menu"
                aria-label={`${menu.label} menu`}
                onKeyDown={(event) => handlePanelKeyDown(event, menu.id)}
                className="absolute left-0 top-full z-50 pt-2"
              >
                <div className="min-w-52 rounded-md border border-hairline bg-canvas p-2">
                  {menu.groups.map((group, groupIndex) => (
                    <div
                      key={group.label ?? groupIndex}
                      role={group.label ? "group" : undefined}
                      aria-label={group.label}
                      className={groupIndex > 0 ? "mt-1.5" : ""}
                    >
                      {group.label && (
                        <p
                          aria-hidden
                          className="px-2 pb-1 pt-1 text-xs font-medium text-mute"
                        >
                          {group.label}
                        </p>
                      )}
                      <div
                        className={
                          group.columns === 2
                            ? "grid grid-cols-2 gap-x-1"
                            : "flex flex-col"
                        }
                      >
                        {group.items.map((itemId) => (
                          <NavItemLink
                            key={itemId}
                            id={itemId}
                            role="menuitem"
                            onSelect={() => closeMenu(menu.id)}
                            className={MENU_ITEM_CLASS}
                          />
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
