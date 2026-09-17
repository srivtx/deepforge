import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { PageShell } from "@/components/PageShell";
import { PROJECTS, type Project } from "@/data/projects";
import { problemHref } from "@/lib/problemLinks";
import { cn, difficultyClasses } from "@/lib/utils";

const siteUrl = (
  process.env.NEXT_PUBLIC_SITE_URL ?? "https://deepforge.app"
).replace(/\/$/, "");

export const dynamicParams = false;

function getProject(id: string): Project | undefined {
  return PROJECTS.find((project) => project.id === id);
}

function projectMetaDescription(project: Project): string {
  const summary = project.blurb.replace(/\s+/g, " ").trim();
  const text = `${summary} A ${project.steps.length}-step ${project.difficulty.toLowerCase()} project on DeepForge: every step is a Python problem you solve from scratch.`;
  if (text.length <= 158) return text;
  return `${text.slice(0, 155).replace(/\s+\S*$/, "")}…`;
}

export function generateStaticParams(): { id: string }[] {
  return PROJECTS.map((project) => ({ id: project.id }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  const { id } = await params;
  const project = getProject(id);
  if (!project) return { title: "Project not found" };

  const description = projectMetaDescription(project);
  const ogImage = {
    url: `${siteUrl}/og?title=${encodeURIComponent(
      project.title,
    )}&subtitle=${encodeURIComponent(
      `${project.steps.length} steps · ${project.difficulty}`,
    )}`,
    width: 1200,
    height: 630,
  };
  return {
    title: `${project.title} — Project`,
    description,
    alternates: {
      canonical: `/projects/${project.id}`,
    },
    openGraph: {
      title: `${project.title} — Project — DeepForge`,
      description,
      url: `/projects/${project.id}`,
      type: "website",
      siteName: "DeepForge",
      images: [ogImage],
    },
    twitter: {
      card: "summary_large_image",
      images: [ogImage],
    },
  };
}

/*
 * Solved state lives in localStorage, so the server renders the zero-progress
 * shell and this inline script re-applies the real progress in the browser.
 * It runs on parse and on every RSC navigation (React mounts inline scripts)
 * and listens to the same progress event the rest of the app dispatches.
 */
const PROGRESS_SCRIPT = `(function(){
  var KEY = "deepforge:progress:v1";
  function read() {
    try {
      var raw = window.localStorage.getItem(KEY);
      if (!raw) return {};
      var parsed = JSON.parse(raw);
      if (!parsed || typeof parsed !== "object" || Array.isArray(parsed)) return {};
      return parsed;
    } catch (error) {
      return {};
    }
  }
  function apply() {
    var roots = document.querySelectorAll("[data-project-detail]");
    if (!roots.length) return;
    var progress = read();
    for (var r = 0; r < roots.length; r++) {
      var root = roots[r];
      var steps = root.querySelectorAll("[data-step-id]");
      var solved = 0;
      var nextSeen = false;
      for (var i = 0; i < steps.length; i++) {
        var step = steps[i];
        var entry = progress[step.getAttribute("data-step-id")];
        var isSolved = !!(entry && entry.solved);
        if (isSolved) {
          solved += 1;
          step.setAttribute("data-solved", "true");
        } else {
          step.removeAttribute("data-solved");
        }
        if (!isSolved && !nextSeen) {
          nextSeen = true;
          step.setAttribute("data-next", "true");
        } else {
          step.removeAttribute("data-next");
        }
      }
      var total = steps.length;
      var pct = total ? Math.round((solved / total) * 100) : 0;
      var bar = root.querySelector("[data-project-bar]");
      if (bar) {
        bar.setAttribute("aria-valuenow", String(pct));
        bar.setAttribute("aria-valuetext", solved + " of " + total + " steps solved (" + pct + "%)");
      }
      var fill = root.querySelector("[data-project-fill]");
      if (fill) fill.style.width = pct + "%";
      var count = root.querySelector("[data-project-count]");
      if (count) count.textContent = solved + "/" + total;
    }
  }
  if (!window.__dfProjectProgress) {
    window.__dfProjectProgress = true;
    window.addEventListener("deepforge:progress-change", apply);
    window.addEventListener("storage", apply);
  }
  apply();
})();`;

export default async function ProjectDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const project = getProject(id);
  if (!project) notFound();

  const index = PROJECTS.findIndex((entry) => entry.id === project.id);
  const prev = index > 0 ? PROJECTS[index - 1] : null;
  const next =
    index >= 0 && index < PROJECTS.length - 1 ? PROJECTS[index + 1] : null;
  const url = `${siteUrl}/projects/${project.id}`;
  const from = `/projects/${project.id}`;
  const description = projectMetaDescription(project);

  const jsonLd = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "CollectionPage",
        "@id": `${url}#page`,
        name: `${project.title} — DeepForge project`,
        description,
        url,
        isPartOf: {
          "@type": "WebSite",
          name: "DeepForge",
          url: siteUrl,
        },
      },
      {
        "@type": "BreadcrumbList",
        "@id": `${url}#breadcrumb`,
        itemListElement: [
          {
            "@type": "ListItem",
            position: 1,
            name: "Home",
            item: siteUrl,
          },
          {
            "@type": "ListItem",
            position: 2,
            name: "Projects",
            item: `${siteUrl}/projects`,
          },
          {
            "@type": "ListItem",
            position: 3,
            name: project.title,
            item: url,
          },
        ],
      },
    ],
  };

  return (
    <PageShell>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(jsonLd).replace(/</g, "\\u003c"),
        }}
      />

      <div
        data-project-detail
        className="mx-auto flex w-full max-w-6xl flex-col gap-8 px-4 py-10 sm:px-6 sm:py-14"
      >
        <nav
          aria-label="Breadcrumb"
          className="flex flex-wrap items-center gap-1.5 text-xs text-body-mid"
        >
          <Link
            href="/"
            className="rounded-sm transition-colors hover:text-ink focus:outline-none focus-visible:ring-1 focus-visible:ring-accent/40"
          >
            Home
          </Link>
          <span aria-hidden className="text-mute">
            /
          </span>
          <Link
            href="/projects"
            className="rounded-sm transition-colors hover:text-ink focus:outline-none focus-visible:ring-1 focus-visible:ring-accent/40"
          >
            Projects
          </Link>
          <span aria-hidden className="text-mute">
            /
          </span>
          <span className="text-body">{project.title}</span>
        </nav>

        <header className="flex flex-col gap-3">
          <div className="flex flex-wrap items-center gap-2">
            <span
              className={cn(
                "rounded-full border px-2 py-0.5 text-xs font-medium",
                difficultyClasses(project.difficulty),
              )}
            >
              {project.difficulty}
            </span>
            {project.tags.map((tag) => (
              <span
                key={tag}
                className="rounded-full border border-hairline bg-canvas-card px-2 py-0.5 text-xs text-body-mid"
              >
                {tag}
              </span>
            ))}
            <span className="font-mono text-xs text-mute">
              {project.steps.length} steps
            </span>
          </div>
          <h1 className="text-2xl font-semibold tracking-tight text-ink sm:text-3xl">
            {project.title}
          </h1>
          <p className="max-w-3xl text-sm leading-relaxed text-body">
            {project.blurb}
          </p>
        </header>

        <section
          aria-labelledby="project-progress"
          className="flex flex-col gap-3 rounded-lg border border-hairline bg-canvas-card p-4 sm:p-5"
        >
          <div className="flex flex-wrap items-center justify-between gap-3">
            <h2
              id="project-progress"
              className="text-sm font-medium text-ink"
            >
              Your progress
            </h2>
            <span
              data-project-count
              suppressHydrationWarning
              className="font-mono text-xs text-body-mid"
            >
              0/{project.steps.length}
            </span>
          </div>
          <div
            data-project-bar
            suppressHydrationWarning
            role="progressbar"
            aria-valuemin={0}
            aria-valuemax={100}
            aria-valuenow={0}
            aria-valuetext={`0 of ${project.steps.length} steps solved (0%)`}
            aria-label={`${project.title} progress`}
            className="h-1 w-full overflow-hidden rounded-full bg-canvas-soft"
          >
            <div
              data-project-fill
              suppressHydrationWarning
              className="h-full w-0 bg-accent transition-all"
            />
          </div>
          <p className="text-[11px] text-body-mid">
            Solve a step and it is marked here automatically — progress stays
            in this browser.
          </p>
        </section>

        <section aria-labelledby="project-steps" className="flex flex-col gap-3">
          <div className="flex flex-wrap items-baseline justify-between gap-2">
            <h2
              id="project-steps"
              className="text-base font-semibold tracking-tight text-ink"
            >
              Steps
            </h2>
            <span className="text-xs text-body-mid">
              Work through them in order — each step builds on the last.
            </span>
          </div>
          <ol className="divide-y divide-hairline overflow-hidden rounded-lg border border-hairline bg-canvas-card">
            {project.steps.map((step, stepIndex) => (
              <li
                key={step.id}
                data-step-id={step.id}
                suppressHydrationWarning
                className="group flex items-center gap-3 px-4 py-3 transition-colors hover:bg-canvas-soft sm:px-5"
              >
                <span
                  aria-hidden
                  className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full border border-hairline font-mono text-[11px] text-mute group-data-[solved=true]:border-accent/40 group-data-[solved=true]:bg-accent/5 group-data-[solved=true]:text-accent"
                >
                  <span className="group-data-[solved=true]:hidden">
                    {stepIndex + 1}
                  </span>
                  <svg
                    className="hidden group-data-[solved=true]:block"
                    width="10"
                    height="10"
                    viewBox="0 0 10 10"
                    fill="none"
                  >
                    <path
                      d="M2 5l2 2 4-4"
                      stroke="currentColor"
                      strokeWidth="1.5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                </span>
                <span className="sr-only group-data-[solved=true]:hidden">
                  Not solved
                </span>
                <span className="sr-only hidden group-data-[solved=true]:inline">
                  Solved
                </span>
                <div className="min-w-0 flex-1">
                  <Link
                    href={problemHref(step.id, from)}
                    className="block truncate rounded-sm text-sm font-medium text-ink transition-colors hover:text-accent focus:outline-none focus-visible:ring-1 focus-visible:ring-accent/40"
                  >
                    {step.title}
                  </Link>
                  <div className="mt-0.5 text-[11px] text-body-mid">
                    {step.category}
                  </div>
                </div>
                <span className="hidden shrink-0 rounded border border-accent/40 px-1.5 py-0.5 text-[10px] font-medium text-accent group-data-[next=true]:inline">
                  Next
                </span>
                <span
                  className={cn(
                    "shrink-0 rounded-full border px-1.5 py-0.5 text-[10px] font-medium",
                    difficultyClasses(step.difficulty),
                  )}
                >
                  {step.difficulty}
                </span>
              </li>
            ))}
          </ol>
        </section>

        {(prev || next) && (
          <nav
            aria-label="Project navigation"
            className="flex flex-col gap-2 border-t border-hairline pt-4 sm:flex-row sm:items-center sm:justify-between"
          >
            {prev ? (
              <Link
                href={`/projects/${prev.id}`}
                className="group flex min-w-0 flex-col rounded-lg border border-hairline bg-canvas-card px-4 py-3 transition-colors hover:border-accent/40 focus:outline-none focus-visible:ring-1 focus-visible:ring-accent/40 sm:max-w-[48%]"
              >
                <span className="text-[11px] text-mute">Previous project</span>
                <span className="truncate text-sm font-medium text-ink group-hover:text-accent">
                  {prev.title}
                </span>
              </Link>
            ) : (
              <span />
            )}
            {next ? (
              <Link
                href={`/projects/${next.id}`}
                className="group flex min-w-0 flex-col rounded-lg border border-hairline bg-canvas-card px-4 py-3 transition-colors hover:border-accent/40 focus:outline-none focus-visible:ring-1 focus-visible:ring-accent/40 sm:max-w-[48%] sm:items-end sm:text-right"
              >
                <span className="text-[11px] text-mute">Next project</span>
                <span className="truncate text-sm font-medium text-ink group-hover:text-accent">
                  {next.title}
                </span>
              </Link>
            ) : (
              <span />
            )}
          </nav>
        )}

        <footer className="border-t border-hairline pt-4 text-xs text-body-mid">
          <Link
            href="/projects"
            className="rounded-sm transition-colors hover:text-ink focus:outline-none focus-visible:ring-1 focus-visible:ring-accent/40"
          >
            All projects
          </Link>
          <span aria-hidden className="px-2 text-mute">
            ·
          </span>
          <Link
            href="/"
            className="rounded-sm transition-colors hover:text-ink focus:outline-none focus-visible:ring-1 focus-visible:ring-accent/40"
          >
            DeepForge home
          </Link>
        </footer>

        <script dangerouslySetInnerHTML={{ __html: PROGRESS_SCRIPT }} />
      </div>
    </PageShell>
  );
}
