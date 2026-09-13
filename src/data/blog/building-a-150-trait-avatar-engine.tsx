import type { BlogPost } from "./types";
import {
  BlogLink,
  BlogProse,
  Callout,
  CodeBlock,
  DecisionTable,
  Figure,
  Footnote,
  ReferenceItem,
  References,
  SectionHeading,
} from "@/components/blog";
import { TraitEnginePipeline } from "@/components/blog/diagrams/TraitEnginePipeline";
import { IdCollisionFix } from "@/components/blog/diagrams/IdCollisionFix";
import { StaleCacheLoop } from "@/components/blog/diagrams/StaleCacheLoop";

export const post: BlogPost = {
  slug: "building-a-150-trait-avatar-engine",
  title: "Building a 150-trait avatar engine (and the hardest bugs we fixed making it)",
  abstract:
    "DeepForge avatars are deterministic: a seed string goes in, one SVG comes out, and the same seed renders the same avatar everywhere. The engine ships 153 traits across an illustrated family and a pixel/voxel family. The two bugs that cost us the most time were not in the art: SVG definition ids are document-global, so avatars on one page collided, and a service worker cached the very bundle that contained its own self-heal. This is the selection pipeline, the fixes, and the numbers behind them.",
  date: "2026-09-13",
  readingMinutes: 9,
  tags: ["avatars", "svg", "service-worker", "performance"],
  authors: ["svx"],
};

const UID_CONTRACT = `// src/lib/nftAvatar/types.ts — the contract on every trait
render: (palette: AvatarPalette, uid: string) => ReactNode;

// src/lib/nftAvatar/traits/heads.tsx — every def id carries the uid
<radialGradient id={\`hd-\${id}-base-\${uid}\`}> ... </radialGradient>
<clipPath id={\`hd-\${id}-clip-\${uid}\`}> ... </clipPath>

// src/components/avatars/NftAvatarArt.tsx — uid is a pure function of the seed
const uid = selection.seed.replace(/[^a-zA-Z0-9_-]/g, "").slice(0, 24) || "df";`;

const SW_LOCAL_GUARD = `// public/sw.js — localhost never reaches the caches
const IS_LOCAL = ["localhost", "127.0.0.1", "0.0.0.0"]
  .includes(self.location.hostname);

// install: unregister anything already there
if (IS_LOCAL) { await self.registration.unregister(); return; }

// fetch: no caching on localhost, so no stale chunk can win
if (IS_LOCAL) return;`;

export function Content() {
  return (
    <BlogProse>
      <p>
        DeepForge avatars are deterministic generative art. A seed string goes
        in — usually a username, sometimes a reroll UUID — and one assembled
        SVG comes out. There is no upload, no server render, no stored image.
        The engine ships <strong>153 traits</strong> — the 150 in the title —
        across two complete style families. The two bugs that cost us the most
        time were not in the art:
        one was SVG&apos;s document-global id namespace, and the other was a
        service worker that had cached its own fix.
      </p>

      <SectionHeading n={1}>Deterministic by construction</SectionHeading>
      <p>
        <code>src/lib/nftAvatar/select.ts</code> is about seventy lines. FNV-1a
        hashes the string <code>&#123;seed&#125;:&#123;style&#125;:traits</code>,
        mulberry32 turns that hash into a stream of numbers, and one call to{" "}
        <code>selectAvatarTraits()</code> makes eight picks: backgrounds,
        clothing, heads, mouths, eyes, headwear, accessories, extras.{" "}
        <code>pickWeighted()</code> subtracts each trait&apos;s weight (1–13)
        from a roll until the roll lands, so a weight-2 trait is roughly a
        sixth as likely as a weight-13 one. The palette comes from{" "}
        <code>pickPalette()</code>, keyed on <code>&#123;seed&#125;:&#123;style&#125;</code>.
      </p>
      <p>
        That is the whole contract: same seed and style, same trait ids, same
        palette. <code>tests/nftAvatar.test.ts</code> pins determinism and
        independence between the two styles. Rarity is not a flag either —{" "}
        <code>rarityScore()</code> counts how many of the eight picks have
        weight ≤ 4, and the picker shows that number as a badge.
      </p>
      <p>
        The catalog is 93 illustrated traits. The wild rares are the fun part:
        rainbow tongue, gold and diamond grillz, third eye, angel wings,
        hologram glitch. The flagship is the Macaque head at weight 2 —{" "}
        <strong>241 SVG nodes and 115 stroked fur clumps</strong> pulled from
        eight clump arrays. None of it would line up if the layers did not
        agree on coordinates, so the anchor contract lives in{" "}
        <code>src/lib/nftAvatar/types.ts</code>, not in each drawing: head
        centered at (48, 50) with radius ~26, eyes at (40, 46) and (56, 46),
        mouth at (48, 62), headwear above y=30, clothing from y=78, accessories
        at the neck and ears. Paint order is fixed there too, and traits can be
        drawn independently because the geometry is frozen in a type file.
      </p>

      <Figure
        label="Fig 1."
        caption="The selection pipeline. One hash, one PRNG stream, eight weighted picks, one fixed-order layer stack. Every pick is a pure function of the seed string, which is why the same seed always draws the same avatar."
      >
        <TraitEnginePipeline />
      </Figure>

      <SectionHeading n={2}>Pixel is a second system, not a filter</SectionHeading>
      <p>
        The pixel family is not a CSS effect over the illustrated set. It is 60
        traits across the same eight categories, drawn on a hidden 48×48 grid
        where 2 SVG units equal one pixel. Every rect is even-sized, silhouettes
        are 2-unit ink borders, and each head paints a five-step tone ramp built
        by <code>mix()</code> in <code>src/lib/nftAvatar/pixel/heads.tsx</code>.
        At render time <code>NftAvatarArt</code> sets{" "}
        <code>shapeRendering=&quot;crispEdges&quot;</code> for pixel avatars and
        leaves the illustrated family antialiased. Selection never notices:{" "}
        <code>traitCategoriesFor(style)</code> swaps the catalog and{" "}
        <code>selectAvatarTraits()</code> is unchanged.
      </p>
      <DecisionTable
        caption="Why pixel got its own trait family instead of a filter"
        rows={[
          {
            option: "CSS filter over the illustrated SVG",
            chosen: false,
            why: "A filter runs at raster time. It cannot move a curve onto an even grid, and it turns hairline strokes into noise rather than pixels.",
          },
          {
            option: "Downscale illustrated traits to 48×48",
            chosen: false,
            why: "Nearest-neighbor keeps the silhouette but loses the discipline: shapes land between pixels, tones stay continuous, and the result reads as low-res illustration.",
          },
          {
            option: "Draw a second family on the 48×48 grid",
            chosen: true,
            why: "Eight mirrored categories, even-sized rects, 2-unit ink silhouettes, five flat tones. The grid is a drawing rule, not a post-process — and selection stays one function.",
          },
        ]}
      />

      <SectionHeading n={3}>The bug: SVG ids are document-global</SectionHeading>
      <p>
        The symptom showed up only on pages with more than one avatar.
        Occasionally one avatar wore another avatar&apos;s gradient, or a clip
        path from somebody else&apos;s head cut it in half. A single avatar always looked right; the second one
        changed the first. The rule we had forgotten is blunt: ids in SVG are
        not scoped to the <code>&lt;svg&gt;</code> element. They are global to
        the document, and <code>url(#hd-macaque-base)</code> resolves to the{" "}
        <em>first</em> element with that id anywhere on the page.
      </p>
      <p>
        Every trait defines its own gradients and clips; the Macaque head alone
        declares a dozen gradients plus two clip paths. Two avatars on one page
        therefore declare the same ids twice, and the first definition wins. The
        second avatar silently borrows the first avatar&apos;s geometry — same
        id, wrong art.
      </p>
      <CodeBlock
        title="The uid contract — types, a trait, and the renderer"
        language="TypeScript"
        code={UID_CONTRACT}
      />
      <p>
        The fix is one parameter. <code>Trait.render</code> receives a{" "}
        <code>uid</code>, and every definition id carries it as a suffix.{" "}
        <code>NftAvatarArt</code> derives that uid from the seed, sanitized and
        sliced to 24 characters. Because the uid is a pure function of the
        seed, the same seed still renders identically everywhere; different
        seeds simply stop sharing definitions. The requirement lives on the{" "}
        <code>Trait</code> type in <code>types.ts</code>, so an artist cannot
        forget it twice.
      </p>
      <Figure
        label="Fig 2."
        caption="Why one page, two avatars, breaks: both SVGs declare hd-macaque-base and every url(#…) reference resolves to the first one in the document. Suffixing each id with a per-seed uid gives every avatar its own defs — and because the uid is stable, a seed still renders identically."
      >
        <IdCollisionFix />
      </Figure>

      <SectionHeading n={4}>The service worker that cached its own fix</SectionHeading>
      <p>
        <code>public/sw.js</code> caches the Pyodide runtime and{" "}
        <code>/_next/static/**</code> cache-first so solving keeps working
        offline. In production that is correct: chunk URLs carry content
        hashes, so a cached URL can never be stale. On localhost it is wrong —
        dev asset URLs are stable, so a worker left behind by a production
        build served locally keeps serving the old CSS and JS after you edit the
        source.
      </p>
      <p>
        The symptoms were absurd. Both theme icons visible at once. The hero and
        footer lost their padding. The aurora background vanished. A hard
        refresh fixed it, and the next navigation brought it back. The cause
        was a worker answering from a cache built hours earlier.
      </p>
      <p>
        Then the trap: our self-heal code lived in{" "}
        <code>src/components/PwaManager.tsx</code>, inside the client bundle.
        The bundle was the stale thing. The code that would unregister the
        worker and clear caches could not run, because it shipped in the chunk
        the worker refused to update — chicken-and-egg, with the browser
        holding the chicken.
      </p>
      <p>
        The escape hatch had to live where caching cannot reach it, so it is an
        inline script in the server HTML: <code>DEV_CACHE_RESET_SCRIPT</code> in{" "}
        <code>src/app/layout.tsx</code>. Navigations are network-first, so this
        script is always current. On localhost it unregisters every worker,
        deletes every cache whose name starts with <code>deepforge-</code>, and
        reloads exactly once, guarded by <code>sessionStorage</code>. The
        worker itself got <code>VERSION = &quot;v2&quot;</code> and an{" "}
        <code>IS_LOCAL</code> check: on localhost it unregisters itself at
        install, and its fetch handler returns before touching a cache.{" "}
        <code>PwaManager</code> now registers the worker only in production.
      </p>
      <CodeBlock
        title="public/sw.js — the localhost guard"
        language="JavaScript"
        code={SW_LOCAL_GUARD}
      />
      <Callout variant="tradeoff" title="Never ship the fix inside the cache">
        <p>
          The hatch duplicates cleanup that also exists on the client, and
          duplication is normally a smell. Here it is the point: the client copy
          lives in the cache and can be stale; the inline copy lives in fresh
          server HTML and cannot. It is localhost-only and reloads once per
          session, so production keeps one clean cache-first path.
        </p>
      </Callout>
      <Figure
        label="Fig 3."
        caption="The loop: the cached bundle serves the old app, and the self-heal that would clear the cache is itself part of that old bundle, so it can never run. The inline script in the server HTML is the only code guaranteed to be fresh — it breaks the loop once, and the worker's localhost guard keeps it broken."
      >
        <StaleCacheLoop />
      </Figure>
      <p>
        One smaller landmine: browser back/forward restores the previous scroll
        position, which dropped the home landing mid-hero under the sticky
        header. <code>src/app/page.tsx</code> now resets that scroll on mount —{" "}
        <code>scrollTo(0, 0)</code> plus a frame and a 60 ms retry — while
        leaving deep links alone.
      </p>

      <SectionHeading n={5}>Uploads stay local-first</SectionHeading>
      <p>
        Uploaded photos go to the public <code>avatars</code> bucket in Supabase
        Storage at{" "}
        <code>&#123;user_id&#125;/avatar.jpg</code> — one object per user,
        upserted, with a cache-busted public URL.{" "}
        <code>src/lib/avatarStorage.ts</code> never throws: without a
        configured client or a cached session every helper resolves to{" "}
        <code>&#123; url: null, error: null &#125;</code> and the UI keeps using
        the local data URL preview. The security boundary is RLS, not the
        client (<code>supabase/migrations/20260914000000_avatars.sql</code>):
        reads are public because an avatar is public identity, while insert,
        update, and delete require{" "}
        <code>(storage.foldername(name))[1] = auth.uid()::text</code>, pinning
        a user to their own folder.
      </p>
      <p>
        The same local-first rule governs the celebration.{" "}
        <code>Celebration.tsx</code> draws a 110-particle canvas burst for 1.5
        seconds using the live theme tokens. <code>ProblemView.tsx</code> arms
        it only when a solve is new, and bails before{" "}
        <code>navigator.vibrate?.(10)</code> when{" "}
        <code>prefers-reduced-motion</code> is set, so the motion and the
        haptic tick stand down together.
      </p>

      <SectionHeading n={6}>The bill: bundle size</SectionHeading>
      <p>
        The work around the engine exposed an old cost: every route used to
        ship roughly 1,290 kB gzip of problem data because the shell pulled the
        whole bank through{" "}
        <code>PageShell → Header → SyncPanel → remote.ts → stores → @/data/problems</code>
        . A generated light index — <code>src/data/problems/problem-meta.ts</code>{" "}
        <Footnote n={1} /> — plus a lazy heavy bank and lazy auth/remote fixed
        the chain. Measured by <code>scripts/measure-bundle.ts</code>: home
        1,553 → 283 kB gzip, <code>/about</code> 1,497 → 183 kB,{" "}
        <code>/problems</code> 1,499 → 251 kB. It is also why the header avatar
        can afford to render on every page.
      </p>
      <p>
        Deterministic art is cheap: no storage, no server, no network. The
        expensive bugs were in the ambient systems — SVG&apos;s global id
        namespace, and a browser cache that outranked our own fix. Put the
        contract in the types, and the escape hatch outside the cache.
      </p>

      <References title="Code and references">
        <ReferenceItem n={1}>
          <code>src/data/problems/problem-meta.ts</code> and{" "}
          <code>scripts/measure-bundle.ts</code> — the light problem index and
          the per-route gzip measurements.
        </ReferenceItem>
        <ReferenceItem n={2}>
          <code>src/lib/nftAvatar/</code> — <code>select.ts</code>,{" "}
          <code>types.ts</code>, <code>palette.ts</code>, the{" "}
          <code>traits/</code> and <code>pixel/</code> families, pinned by{" "}
          <code>tests/nftAvatar.test.ts</code>.
        </ReferenceItem>
        <ReferenceItem n={3}>
          <code>src/components/avatars/NftAvatarArt.tsx</code> and{" "}
          <code>src/components/AvatarPicker.tsx</code> — the layer-stack
          renderer that derives the per-seed uid.
        </ReferenceItem>
        <ReferenceItem n={4}>
          <code>public/sw.js</code>, <code>src/app/layout.tsx</code>, and{" "}
          <code>src/components/PwaManager.tsx</code> — the versioned worker,
          the inline self-heal, and production-only registration.
        </ReferenceItem>
        <ReferenceItem n={5}>
          <code>src/lib/avatarStorage.ts</code> and{" "}
          <code>supabase/migrations/20260914000000_avatars.sql</code> — the
          bucket client and the folder-scoped RLS policies.
        </ReferenceItem>
        <ReferenceItem n={6}>
          <code>src/components/Celebration.tsx</code> and{" "}
          <code>src/components/ProblemView.tsx</code> — the first-solve-only
          burst and its reduced-motion gate.{" "}
          <BlogLink href="/about">Read about DeepForge</BlogLink>.
        </ReferenceItem>
      </References>
    </BlogProse>
  );
}
