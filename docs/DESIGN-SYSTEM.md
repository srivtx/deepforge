# DeepForge Design System

The single source of truth for how every page looks, moves, and behaves.
Agents: read this before touching UI. If something here conflicts with a task
prompt, ask — do not invent a third pattern.

## 1. Philosophy

Dark, minimal, x.ai-inspired. Content first: the interface disappears and the
problem, code, or data is the hero. One accent colour, one radius, no clutter,
no decorative chrome. If a border, shadow, or animation does not help the user
read or act faster, remove it.

## 2. Tokens (never hardcode colours)

| Token | Use | Value (dark) |
|---|---|---|
| `bg-canvas` | page background | `#0a0a0a` |
| `bg-canvas-card` | cards, panels | `#111111` |
| `bg-canvas-soft` | hover surfaces, inputs | `#161616` |
| `bg-canvas-mid` | track / rail backgrounds | `#1a1a1a` |
| `border-hairline` | every border | `#1f1f1f` |
| `text-ink` | headings, primary action | `#ffffff` |
| `text-body` | paragraphs, code | `#d4d4d4` |
| `text-body-mid` | secondary text, labels | `#8b8b8b` |
| `text-mute` | meta, ids, timestamps | `#8a8a8a` |
| `text-accent` / `bg-accent` | the one accent (phosphor green) | `#7FFF9F` |
| `text-error` / `text-warning` / `text-info` | states only | tokens |

- Radius: `rounded-lg` (8px) for everything except pills (`rounded-full`).
- Fonts: Inter (`font-sans`) for UI, JetBrains Mono (`font-mono`) for code,
  ids, counts, and tabular numbers only.
- Utility tokens are Tailwind classes: `bg-canvas-card`, `text-body-mid`,
  `border-hairline`, `text-accent`, `bg-accent/5` etc.

## 3. Layout and rhythm

- Page container: `mx-auto w-full max-w-6xl px-4 sm:px-6` (narrow prose uses
  `max-w-3xl` INSIDE the container, never a nested container).
- Page shell: every route renders `<PageShell>` (header, footer, palette,
  overlay owner). Pages pass `title` + `description` from `SECTIONS_BY_ID` in
  `src/lib/sections.ts`; exactly ONE `<h1>` per page.
- Whole-page rhythm: `py-10 sm:py-14`. A section inside a page: `py-8 sm:py-12`.
  Never stack two `py-12+` blocks next to each other.
- Grids: `grid gap-3`, 1 col <768px, `md:grid-cols-2`, `lg:grid-cols-3`.
- Cards: `rounded-lg border border-hairline bg-canvas-card p-4 sm:p-5`.
- Lists: `space-y-3` (never `space-y-1` for cards).
- Sticky elements must clear the 48px header (`scroll-mt-16`).

## 4. Typography scale

- H1 (PageShell): `text-2xl sm:text-3xl font-semibold tracking-tight text-ink`.
- Section heading: `text-lg font-semibold tracking-tight text-ink`.
- Section subheading / live stats line: `text-sm font-medium text-body-mid`.
- Body: `text-sm leading-relaxed text-body`.
- Meta: `text-xs text-body-mid`; ids/numbers: `font-mono text-[11px] text-mute`.
- No uppercase eyebrows except the optional PageShell `eyebrow`; no `//` markers.

## 5. Interaction patterns

- Focus: every interactive element gets
  `focus:outline-none focus-visible:ring-1 focus-visible:ring-accent/40`
  (primary buttons may use `ring-2`).
- Touch targets: `min-h-11 sm:min-h-0` on buttons/rows; icon buttons `h-11 w-11`
  below `sm`.
- Buttons: primary = `border-accent/40 bg-accent/5 text-accent hover:bg-accent/10`;
  secondary = `border-hairline hover:bg-canvas-soft`; ghost = text only.
- Empty states: centered, muted, one clear CTA — never a bare sentence.
- Tables/wide content: wrap in `df-scroll overflow-x-auto`, never let the page
  scroll horizontally.

## 6. Navigation rules

- Destinations are real routes (see `SECTIONS_BY_ID[*].href`). Overlays are only
  for transient UI: command palette, assistant, sync panel.
- Opening a problem ALWAYS navigates to `/problems/<id>`. Never open a problem
  overlay from a list or chip; the overlay variant of `ProblemView` is retired.
- Detail pages and workspaces start with a back control — `← All problems`,
  `← Paths` — a labelled link, never an unlabelled ✕. ✕ is only for true modals
  (palette, assistant, sync, confirms).
- The header brand always links home (`/`); on `/` it scrolls to top.

## 7. Motion

- Fast and quiet: micro-interactions 150–250ms `ease-out`; reveals 400–600ms.
- Reveal on scroll: opacity 0→1 + `translateY(12px→0)`, stagger ~60ms via the
  `Reveal` component; never re-hide content that has been seen.
- Numbers count up once on first view (`CountUp`).
- Hover: cards may lift `-translate-y-0.5` and border `hover:border-accent/40`;
  no scale >1.02, no bouncing, no infinite loops except a subtle ambient hero
  background.
- ALWAYS respect `prefers-reduced-motion: reduce` — the `Reveal`/`CountUp`
  components and CSS keyframes must no-op or snap. Motion is decoration; content
  must render identically without it.
- Never animate layout-affecting properties (width/height/top/left); use
  transform/opacity only. Pause ambient animation when off-screen.

## 8. Accessibility

- One `<h1>` per page; headings descend in order.
- Every icon-only control has `aria-label`; state changes use `aria-live` when
  they matter (sync status, run results).
- Escape closes the topmost overlay only; focus returns to the trigger.
- `prefers-reduced-motion` respected globally; colour contrast stays ≥ AA on
  canvas backgrounds.

## 9. Checklist before shipping a page

1. Renders inside `PageShell`; one H1; correct title/blurb from the registry.
2. Container + rhythm classes match section 3; no duplicate containers/padding.
3. Cards/pills/buttons use section 5 classes; every control has a focus ring and
   a 44px target on mobile.
4. 375px, 768px, 1024px: no horizontal scroll, nothing clipped, nothing cramped.
5. Motion is subtle, reduced-motion safe, and does not shift layout.
6. `bunx tsc --noEmit`, `npx eslint <files>`, `bun test` all green.
