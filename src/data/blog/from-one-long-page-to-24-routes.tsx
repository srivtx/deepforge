import type { BlogPost } from "./types";
import {
  BlogLink,
  BlogProse,
  Callout,
  DecisionTable,
  Figure,
  Footnote,
  ReferenceItem,
  References,
  SectionHeading,
} from "@/components/blog";
import {
  BundleSplit,
  DesignTokens,
  RoutingDecision,
} from "@/components/blog/diagrams";

export const post: BlogPost = {
  slug: "from-one-long-page-to-24-routes",
  title: "From one long page to 24 routes",
  abstract:
    "DeepForge started as a single scrolling page with section state and modals stacked on top. It now ships 24 top-level destinations, 5,050 static problem pages, and 28 learning-path pages — and the routes that stopped importing the whole problem bank got 83 to 88 percent smaller on first load. This is the routing taxonomy, the shell contract, and the measured numbers.",
  date: "2026-09-13",
  readingMinutes: 10,
  tags: ["next.js", "performance", "design-system"],
  authors: ["svx"],
};

export function Content() {
  return (
    <BlogProse>
      <p>
        The first version of DeepForge had one route. Everything — problems,
        paths, contests, the leaderboard, the assistant — was a section of{" "}
        <code>src/app/page.tsx</code> switched by view state, with a modal
        layer for anything that needed to feel focused. It was fast to build
        and it worked, until the product grew into 5,050 problems across 15
        categories and the browser back button started feeling like a promise
        we could not keep.
      </p>

      <SectionHeading n={1}>The one-page era</SectionHeading>
      <p>
        With a single page, nothing was linkable except by hash, nothing was
        indexable except the landing, and every interaction had to be encoded
        in component state. Opening a problem meant stacking an overlay over
        the list you were already on; closing it returned you to a scroll
        position that might or might not survive. The modal architecture was
        genuinely good at one thing — keeping transient UI in place — and
        genuinely bad at everything that wants a URL: sharing a path, sending
        someone a problem, restoring a reading position, or rendering a page
        that search engines can index.
      </p>
      <p>
        The migration landed in two commits: section modals became a
        categorized hub of real destinations, then the problem workspace
        overlay was retired so opening a problem always navigates to{" "}
        <code>/problems/&lt;id&gt;</code>. Today the app serves 24 top-level
        destinations — the home landing plus 23 entries in{" "}
        <code>src/lib/sections.ts</code> — and dynamic pages for 5,050
        problems, 28 paths, and 15 categories, all statically generated.
      </p>

      <SectionHeading n={2}>The taxonomy: transient versus sustained</SectionHeading>
      <p>
        The rule we settled on is a single question: will the user come back to
        this, share it, or expect the back button to work? If the answer is
        yes, it is a route. If it vanishes the moment the task is done — the
        command palette, the assistant, the sync panel, a confirmation — it is
        an overlay.
      </p>
      <Figure label="Fig 1." caption="The taxonomy as a decision tree. Transient UI stays in overlays; anything sustained becomes a route with a real URL.">
        <RoutingDecision />
      </Figure>
      <p>
        Two supporting rules keep the split from drifting. Detail pages start
        with a labelled back control — <code>← All problems</code>,{" "}
        <code>← Engineering</code> — while <code>✕</code> is reserved for true
        modals. And opening a problem is never an overlay, not from a list,
        not from a chip, not from search: components announce a problem through
        the <code>deepforge:open-problem</code> event and the shell routes to
        the page. One code path for the most important interaction in the
        product.
      </p>
      <DecisionTable
        caption="Where each surface lives"
        rows={[
          {
            option: "Open a problem in an overlay",
            chosen: false,
            why: "Back, sharing, and indexing all break. The workspace became a real page at /problems/<id> with saved code and progress read locally.",
          },
          {
            option: "Keep section state in one hub page",
            chosen: false,
            why: "A hub can only ever be one URL. Twenty-three destinations became 23 routes with their own titles, descriptions, and canonicals.",
          },
          {
            option: "Overlay only the transient UI",
            chosen: true,
            why: "The palette, assistant, and sync panel never need a URL, and they benefit from staying in place. Escape closes the top layer and focus returns to the trigger.",
          },
        ]}
      />

      <SectionHeading n={3}>The shell contract</SectionHeading>
      <p>
        Twenty-four pages stay consistent because they share one shell and one
        registry. Every route renders <code>PageShell</code>, which owns the
        header with the live solved count, the footer, the command palette,
        the skip link, and the problem-opening event. A page passes its title
        and blurb from <code>SECTIONS_BY_ID</code>, which guarantees exactly
        one <code>&lt;h1&gt;</code> per route and means the page title, the
        navigation label, and the metadata description come from the same
        string.
      </p>
      <p>
        The shell is also a layout contract: a page container of{" "}
        <code>mx-auto w-full max-w-6xl px-4 sm:px-6</code>, whole-page rhythm
        of <code>py-10 sm:py-14</code>, and a narrow prose column of{" "}
        <code>max-w-3xl</code> nested inside the container rather than a second
        container of its own. That one rule is why an index page, a detail
        page, and this post all start at the same edge.
      </p>

      <SectionHeading n={4}>The data seam: stop shipping 5 MB</SectionHeading>
      <p>
        Routes solved the navigation problem but created a bundle problem. The
        problem dataset is a 6.3 MB source directory, and many client
        components imported the full objects just to render a title and a
        difficulty badge. Worse, the header pulled in the sync panel, which
        pulled in the auth and remote modules, which pulled the dataset into
        every route through a chain nobody intended. The measured result: the
        raw data chunk alone was 5,224.5 kB — 1,271.1 kB gzipped — on pages
        that never opened a problem.
      </p>
      <p>
        Two seams fixed it. <code>src/data/problems/problem-meta.ts</code>{" "}
        exposes a light index — id, title, category, difficulty — and list,
        stat, and counter consumers import that instead of the full
        bank.<Footnote n={1} /> And the header data chain was broken by making
        auth and the remote sync engine lazy, so routes that do not use them no
        longer load them. Problem pages still load the full object, but only
        when you open a problem.
      </p>

      <SectionHeading n={5}>The measured wins</SectionHeading>
      <p>
        <code>scripts/measure-bundle.ts</code> parses every prerendered route
        in the build, collects the chunks each page actually loads, and reports
        raw and gzip sizes. Before the split, <code>/about</code> loaded 1,490
        kB of gzipped JavaScript and <code>/problems</code> loaded 1,499 kB.
        After:
      </p>
      <Figure label="Fig 2." caption="First-load JS in gzip kilobytes, measured from the build with scripts/measure-bundle.ts. /about and /problems dropped 88% and 83%; the home landing still ships the full problem bank.">
        <BundleSplit />
      </Figure>
      <p>
        The honest part of the chart is the third bar. The home landing still
        weighs 1,552.8 kB gzip because it needs live counters over the full
        bank, and <code>/stats</code>, <code>/badges</code>,{" "}
        <code>/playlists</code>, and <code>/certificates</code> are still in
        the same range. Splitting the remaining consumers is the next
        performance task in <code>docs/next-wave-plan.md</code>, and the goal
        is boring: keep the data behind a lazy boundary so a route pays for it
        only when it opens something.
      </p>

      <SectionHeading n={6}>Keeping 24 pages consistent</SectionHeading>
      <p>
        A routing migration is also a design migration: twenty-four pages is
        more than anyone can hold in their head, so consistency has to be
        written down and enforced by structure.{" "}
        <code>docs/DESIGN-SYSTEM.md</code> is the single source for tokens, the
        type scale, the rhythm, the interaction patterns, and the motion
        rules. The shell implements the layout half; the document covers the
        rest.
      </p>
      <Figure label="Fig 3." caption="The token sheet the routes are built from: one palette that flips with the theme, one type scale, one 8px radius, and two motion bands.">
        <DesignTokens />
      </Figure>
      <p>
        Motion is part of the contract, not a coat of paint. Cards fade and
        rise once through <code>Reveal</code>, numbers count up once through{" "}
        <code>CountUp</code>, and ambient animation pauses off-screen and snaps
        off under <code>prefers-reduced-motion</code>. Only transform and
        opacity move. A page that follows the checklist renders identically
        without JavaScript, which matters when most routes are static HTML.
      </p>
      <Callout variant="info" title="Why a document and not a component library">
        <p>
          With one maintainer and Tailwind v4, a written contract plus shared
          shell beats an abstraction layer. There is no second component to
          keep in sync with the tokens — the classes come from the theme, and
          the checklist is short enough to read before every page ships.
        </p>
      </Callout>

      <SectionHeading n={7}>Honest holdouts</SectionHeading>
      <p>
        One destination still opens a reader as an overlay: the interactive
        articles in <code>src/components/Articles.tsx</code>. The modal
        treatment predates the routes migration, and by the taxonomy it is
        wrong — an article is exactly the thing you want to share and return
        to. Converting it to <code>/articles/&lt;slug&gt;</code> is the next
        pass, and until then it is the one place the old pattern survives.
      </p>
      <p>
        The other holdouts are budgets. Detail pages still pay for the full
        problem object — correctly, but shared code could split further. And
        the sitemap advertises 5,050 problem URLs, 28 path URLs, and 15
        category URLs; static generation is the thing to watch as the bank
        grows.
      </p>
      <p>
        The version of DeepForge that exists today is the direct result of
        taking navigation seriously: every destination is a URL, every URL is
        a page, and every page loads only what it needs.{" "}
        <BlogLink href="/problems">Browse the problems</BlogLink> and the
        taxonomy is visible in the address bar.
      </p>

      <References title="Code and references">
        <ReferenceItem n={1}>
          <code>src/data/problems/problem-meta.ts</code> and{" "}
          <code>scripts/generate-problem-meta.ts</code> — the light problem
          index and the script that keeps it current.
        </ReferenceItem>
        <ReferenceItem n={2}>
          <code>scripts/measure-bundle.ts</code> — per-route first-load JS
          measurement from a real build.
        </ReferenceItem>
        <ReferenceItem n={3}>
          <code>docs/DESIGN-SYSTEM.md</code> and{" "}
          <code>src/components/PageShell.tsx</code> — the written contract and
          the shell that implements the layout half of it.
        </ReferenceItem>
        <ReferenceItem n={4}>
          <code>docs/next-wave-plan.md</code> — the remaining bundle work
          (NW-02) and the route count.
        </ReferenceItem>
      </References>
    </BlogProse>
  );
}
