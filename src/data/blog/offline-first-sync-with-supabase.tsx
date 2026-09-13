import type { BlogPost } from "./types";
import {
  BlogLink,
  BlogProse,
  Callout,
  CodeBlock,
  DecisionTable,
  Figure,
  ReferenceItem,
  References,
  SectionHeading,
} from "@/components/blog";
import { SyncArchitecture } from "@/components/blog/diagrams";

export const post: BlogPost = {
  slug: "offline-first-sync-with-supabase",
  title: "Offline-first sync with Supabase",
  abstract:
    "DeepForge works with no account and no network: every store reads synchronously from localStorage. Signing in is optional, so it cannot be allowed to change how the app reads data. This is the sync seam we built around that constraint — one JSONB row per store, debounced pushes, and per-store merges instead of a wholesale last-write-wins.",
  date: "2026-09-06",
  readingMinutes: 11,
  tags: ["sync", "supabase", "offline-first"],
  authors: ["svx"],
};

const STORE_SPEC = `export interface StoreSpec<T> {
  id: StoreId;
  storageKey: string;   // deepforge:progress:v1, ...
  event: string;        // deepforge:progress-change
  empty: () => T;
  parse: (raw: string | null) => T;
  serialize: (v: T) => string;
  merge?: (local: T, remote: T) => T;
}`;

const MERGE_PROGRESS = `// excerpt — the per-problem rules inside mergeProgress()
const solved = Boolean(left.solved || right.solved);
const attempted = Boolean(left.attempted || right.attempted);
const lastOpened = laterValue(left.lastOpened, right.lastOpened);
const solvedAt = solved ? earlierValue(left.solvedAt, right.solvedAt) : undefined;
const savedCode = pickNewerSide(
  left.savedCode, right.savedCode, left.lastOpened, right.lastOpened,
);
// attempted / solved sticky · earliest solve · LWW editor state
// keys present on either side are kept, then the entry is rebuilt`;

function SyncSequence() {
  return (
    <svg
      viewBox="0 0 760 270"
      role="img"
      aria-labelledby="syncseq-title syncseq-desc"
      className="h-auto w-full"
    >
      <title id="syncseq-title">First sign-in versus later devices</title>
      <desc id="syncseq-desc">
        The first device to sign in pushes every local store in one direction
        and stamps profiles.synced_at. Later devices pull the remote rows,
        merge them with whatever is already local, and push the merged result.
      </desc>
      <defs>
        <marker
          id="syncseq-arrow"
          viewBox="0 0 10 10"
          refX="8"
          refY="5"
          markerWidth="6"
          markerHeight="6"
          orient="auto"
        >
          <path d="M0 0 10 5 0 10z" className="fill-body-mid" />
        </marker>
      </defs>

      <rect
        x={30}
        y={70}
        width={190}
        height={64}
        rx={8}
        strokeWidth={1.5}
        className="fill-canvas stroke-hairline"
      />
      <text x={50} y={98} className="fill-ink text-[12.5px] font-medium">
        Device A
      </text>
      <text x={50} y={118} className="fill-body-mid text-[10px] font-mono">
        local-only until now
      </text>

      <rect
        x={285}
        y={70}
        width={190}
        height={64}
        rx={8}
        strokeWidth={1.5}
        strokeDasharray="6 5"
        className="fill-accent/5 stroke-accent/40"
      />
      <text x={305} y={98} className="fill-ink text-[12.5px] font-medium">
        Supabase
      </text>
      <text x={305} y={118} className="fill-body-mid text-[10px] font-mono">
        user_stores · user_stats
      </text>

      <rect
        x={540}
        y={70}
        width={190}
        height={64}
        rx={8}
        strokeWidth={1.5}
        className="fill-canvas stroke-hairline"
      />
      <text x={560} y={98} className="fill-ink text-[12.5px] font-medium">
        Device B
      </text>
      <text x={560} y={118} className="fill-body-mid text-[10px] font-mono">
        signs in later
      </text>

      <path
        d="M220 94H278"
        fill="none"
        strokeWidth={1.5}
        markerEnd="url(#syncseq-arrow)"
        className="stroke-body-mid"
      />
      <text
        x={249}
        y={84}
        textAnchor="middle"
        className="fill-body-mid text-[9.5px] font-mono"
      >
        push all
      </text>

      <path
        d="M475 94H533"
        fill="none"
        strokeWidth={1.5}
        markerEnd="url(#syncseq-arrow)"
        className="stroke-body-mid"
      />
      <text
        x={504}
        y={84}
        textAnchor="middle"
        className="fill-body-mid text-[9.5px] font-mono"
      >
        pull + merge
      </text>
      <path
        d="M533 118H482"
        fill="none"
        strokeWidth={1.5}
        markerEnd="url(#syncseq-arrow)"
        className="stroke-body-mid"
      />
      <text
        x={504}
        y={140}
        textAnchor="middle"
        className="fill-body-mid text-[9.5px] font-mono"
      >
        push merged
      </text>

      <path
        d="M30 178H730"
        fill="none"
        strokeWidth={1}
        className="stroke-hairline"
      />
      <text
        x={380}
        y={208}
        textAnchor="middle"
        className="fill-accent text-[10.5px]"
      >
        first sign-in = one-way push · later devices = pull → merge → push
      </text>
      <text
        x={380}
        y={234}
        textAnchor="middle"
        className="fill-mute text-[10px] font-mono"
      >
        profiles.synced_at gates the migration
      </text>
    </svg>
  );
}

export function Content() {
  return (
    <BlogProse>
      <p>
        The pitch is that you can start solving immediately: no account, no
        sign-up wall, no spinner where your progress should be. Progress lives
        in <code>localStorage</code> and reads are synchronous. When we added
        optional accounts, the hard requirement was that this stays true —
        sign-in as an enhancement, never a dependency on the read path.
      </p>

      <SectionHeading n={1}>The constraint: reads cannot wait</SectionHeading>
      <p>
        Most sync designs start from the network and cache downward. We did the
        opposite. Every store keeps its existing synchronous{" "}
        <code>get()</code> that reads from <code>localStorage</code> and
        returns. There is no async accessor, no loading state, and no failure
        mode where storage is slow. The network is a background concern that
        may push data when it exists and may not exist at all.
      </p>
      <p>
        That decides everything else. Conflict resolution runs on the client,
        because the client already has the data. The server accepts a few
        coarse writes, because the client decides when they are worth sending.
        And the feature disappears cleanly when the two Supabase env vars are
        unset — most local development and every test runs without them.
      </p>

      <SectionHeading n={2}>The seam: one factory, one adapter</SectionHeading>
      <p>
        Every persisted feature is described by a <code>StoreSpec</code> and
        created by <code>createStore</code> in{" "}
        <code>src/lib/sync/store.ts</code>. The factory keeps the synchronous
        local behavior and adds one hook after a write.
      </p>
      <CodeBlock title="src/lib/sync/types.ts" language="TypeScript" code={STORE_SPEC} />
      <p>
        On a write, the store updates <code>localStorage</code>, dispatches its
        existing <code>deepforge:*-change</code> event so the UI updates in the
        same tab, and then calls <code>notifyLocalWrite(id)</code>. In{" "}
        <code>src/lib/sync/backend.ts</code> that function checks the selected
        backend: remote only when both env vars are present and a cached
        session exists. If it is remote, the write schedules a debounced flush
        (~1.5 seconds per store) and attaches <code>pagehide</code> and{" "}
        <code>visibilitychange</code> listeners so a backgrounded tab flushes
        before it freezes.
      </p>
      <p>
        The session cache stores a user id and an email. Tokens never touch our
        keys — supabase-js keeps its own session under{" "}
        <code>sb-&lt;ref&gt;-auth-token</code>. The storage adapter fails soft:
        SSR, private mode, and quota errors resolve to null and a no-op instead
        of throwing.
      </p>

      <Figure label="Fig 1." caption="The seam in one picture. Nine stores write synchronously through a thin adapter; only the debounced flush and the pull path ever touch the network.">
        <SyncArchitecture />
      </Figure>

      <SectionHeading n={3}>Nine stores, one table</SectionHeading>
      <p>
        The schema is deliberately small. Personal state lives in{" "}
        <code>user_stores</code> — one row per user per store, keyed{" "}
        <code>(user_id, store_id)</code>, with the serialized store as JSONB
        and an <code>updated_at</code> column. Progress, daily streaks,
        collections, contests, interview results, pen-and-paper answers, labs,
        research attempts, and the username are nine rows in one table, not
        nine tables. <code>user_stats</code> holds the leaderboard projection —
        score, solved, streaks — upserted when progress is pushed, and a{" "}
        <code>security_invoker</code> view joins it to public profiles so RLS
        still applies underneath.
      </p>
      <p>
        The trade is obvious: the database cannot query inside the store
        payloads, and a schema change means changing the client serializer. In
        exchange, adding a feature that persists does not require a migration —
        the store shape is the client&apos;s business.
      </p>

      <SectionHeading n={4}>Merging, not replacing</SectionHeading>
      <p>
        The row-level write is simple: the client upserts, newest write wins.
        But a pull never installs the remote payload over local state. Each
        store has a pure merge function in{" "}
        <code>src/lib/sync/remoteMerge.ts</code> that returns the union of both
        devices; the merged result is written locally and pushed back.
      </p>
      <DecisionTable
        caption="How a pull resolves two versions of the same store"
        rows={[
          {
            option: "Whole-store last-write-wins",
            chosen: false,
            why: "Simple on the server, but one device's push would erase another device's session of work.",
          },
          {
            option: "Per-store merge functions",
            chosen: true,
            why: "Each data shape gets the rule that matches how it is edited: sticky flags, earliest solves, unions, direction-aware bests.",
          },
          {
            option: "CRDTs or an operation log",
            chosen: false,
            why: "A dependency and a schema built for concurrent editing we do not have. Nine small JSON documents merge fine with unions.",
          },
        ]}
      />
      <p>
        Progress is the most interesting merge: <code>attempted</code> and{" "}
        <code>solved</code> are sticky true, <code>solvedAt</code> keeps the
        earliest solve, <code>lastOpened</code> is last-write-wins, and saved
        code follows whichever side has the newer <code>lastOpened</code> — the
        editor you touched most recently wins.
      </p>
      <CodeBlock
        title="src/lib/sync/remoteMerge.ts · progress"
        language="TypeScript"
        code={MERGE_PROGRESS}
      />
      <p>
        The other rules follow the same spirit. Daily streaks are the union of
        solved dates with the streak recomputed from the set. Labs keep the
        best score and OR the passed flag. Research keeps the best score in the
        challenge&apos;s own direction and unions the attempt log, capped at
        fifty. Collections preserve local order and let the newer{" "}
        <code>updatedAt</code> win per item. Contests and interviews
        append-merge by id and completion time.
      </p>

      <SectionHeading n={5}>First sign-in is a one-way push</SectionHeading>
      <p>
        A user who has been solving locally for a month and then signs in must
        never lose a solve. <code>afterSignIn</code> pushes every local store
        as-is when <code>profiles.synced_at</code> is empty, then stamps the
        flag. There is nothing remote to merge yet, because this account has
        never seen another device.
      </p>
      <Figure label="Fig 2." caption="First sign-in pushes local state up and stamps the profile. Later devices pull, merge, and push, so both ends converge on the union.">
        <SyncSequence />
      </Figure>
      <p>
        Later devices take the other branch: pull all nine, merge with local,
        push the merged result. Manual &quot;sync now&quot; does the same and
        stamps a local timestamp only when nothing errored. No sync entry point
        throws; failures surface through the sync state the panel subscribes
        to.
      </p>

      <SectionHeading n={6}>RLS is the security boundary</SectionHeading>
      <p>
        The publishable key ships in the browser, so every table is protected
        by row-level security rather than by the client. <code>user_stores</code>{" "}
        is readable only by its owner; <code>user_stats</code> and{" "}
        <code>profiles</code> are publicly readable because they feed the
        leaderboard — aggregated counts and usernames only. Comments and forum
        rows are public to read and writable by their author, and upvote
        counters change only through <code>security definer</code> RPCs revoked
        from anonymous callers.
      </p>
      <p>
        Two ways in: a magic link and Google OAuth. Both resolve failures
        inline — if Google is not enabled in the dashboard, the button reports
        the provider error and magic links keep working. All of it is optional:
        with the env vars unset, the app never imports Supabase and behaves
        exactly like the local-only product it was.
      </p>

      <SectionHeading n={7}>What we deliberately did not build</SectionHeading>
      <p>
        No realtime subscriptions: a second tab sees changes at the next pull,
        not while you type. No pagination: nine rows per user do not need it.
        No tombstones: deletes do not propagate, so clearing progress locally
        can be resurrected by another device&apos;s pull. No server clock:{" "}
        <code>updated_at</code> is client-authored, so a skewed device can win
        a row-level race. No retry queue: a failed push retries on the next
        write or manual sync. No server-side merge: the merge needs the local
        data anyway.
      </p>
      <Callout variant="tradeoff" title="Deletes are the sharp edge">
        <p>
          The merge model is built to keep solves, not to remove them. If that
          ever matters, the answer is tombstones in the store payloads — a
          small change to the merge functions and the clear path — not a move
          to a different sync architecture. Until then the product would
          rather resurrect a solve than lose one.
        </p>
      </Callout>
      <p>
        The local-only tests take the seam seriously: the sync suite injects a
        fake client and drives sign-in, migration, pull-merge-push, offline
        writes, and error states without a network. That is how 252 unit tests
        stay green in CI with no Supabase project at all.
      </p>

      <References
        title="Code and references"
      >
        <ReferenceItem n={1}>
          <code>src/lib/sync/</code> — <code>store.ts</code>,{" "}
          <code>localAdapter.ts</code>, <code>backend.ts</code>,{" "}
          <code>remote.ts</code>, <code>remoteMerge.ts</code>.
        </ReferenceItem>
        <ReferenceItem n={2}>
          <code>supabase/migrations/20260913000000_init.sql</code> —{" "}
          <code>profiles</code>, <code>user_stores</code>,{" "}
          <code>user_stats</code>, the <code>leaderboard</code> view, RLS
          policies, and the upvote RPCs.
        </ReferenceItem>
        <ReferenceItem n={3}>
          <code>docs/SETUP-SUPABASE.md</code> and{" "}
          <code>docs/supabase-plan.md</code> — schema rationale and the human
          setup checklist.
        </ReferenceItem>
      </References>

      <p>
        If you want the shape of the product rather than the implementation,{" "}
        <BlogLink href="/about">read about DeepForge</BlogLink> — local-first
        is the feature, not a fallback.
      </p>
    </BlogProse>
  );
}
