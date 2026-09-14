"use client";

import {
  useEffect,
  useMemo,
  useRef,
  useState,
  useSyncExternalStore,
} from "react";
import { formatRelativeTime } from "@/lib/comments";
import { getAuthEmail, isSupabaseConfigured, onAuthChange } from "@/lib/auth";
import { onSessionChange } from "@/lib/sync/backend";
import {
  createGroup,
  formatNudgeCooldown,
  getGroupBoard,
  getGroupLeaderboard,
  getGroupSelfId,
  getGroupSnapshot,
  joinGroup,
  leaveGroup,
  listGroupNudges,
  listMyGroups,
  markNudgeSeen,
  nudgeCooldownRemaining,
  sendNudge,
  subscribeGroups,
  subscribeRealtime,
  type GroupLeaderboard,
  type GroupMemberInfo,
  type GroupNudge,
  type GroupSnapshot,
  type StudyGroup,
} from "@/lib/sync/social";
import { cn } from "@/lib/utils";

const EMPTY_GROUPS: GroupSnapshot = { groups: [], members: {}, nudges: [] };

function getServerGroupSnapshot(): GroupSnapshot {
  return EMPTY_GROUPS;
}

function useSignedIn(): boolean {
  const [signedIn, setSignedIn] = useState(false);
  useEffect(() => {
    if (!isSupabaseConfigured()) return;
    const update = (email: string | null) => setSignedIn(email !== null);
    update(getAuthEmail());
    return onAuthChange(update);
  }, []);
  return signedIn;
}

function subscribeIdentity(onChange: () => void): () => void {
  return onSessionChange(() => onChange());
}

function getIdentitySnapshot(): string {
  return getGroupSelfId();
}

function getServerIdentity(): string {
  return "local";
}

const FIELD_CLASSES =
  "w-full rounded-lg border border-hairline bg-canvas-soft px-3 py-2 text-sm text-ink placeholder:text-mute focus:border-accent/50 focus:outline-none focus:ring-1 focus:ring-accent/30";

const PRIMARY_BUTTON_CLASSES =
  "inline-flex min-h-11 items-center justify-center rounded-lg bg-accent px-3.5 py-1.5 text-xs font-medium text-canvas transition-opacity hover:opacity-90 focus:outline-none focus-visible:ring-2 focus-visible:ring-accent/40 disabled:cursor-default disabled:opacity-40 sm:min-h-0";

const SECONDARY_BUTTON_CLASSES =
  "inline-flex min-h-11 items-center justify-center rounded-lg border border-hairline px-3 py-1.5 text-xs text-body-mid transition-colors hover:bg-canvas-soft hover:text-ink focus:outline-none focus-visible:ring-2 focus-visible:ring-accent/40 disabled:cursor-default disabled:opacity-40 sm:min-h-0";

const CHIP_CLASSES =
  "inline-flex items-center rounded-full border border-hairline px-2 py-0.5 text-[10px] text-body-mid";

function GroupStat({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-[10px] uppercase tracking-wide text-mute">{label}</p>
      <p className="mt-0.5 text-sm font-medium text-ink">{value}</p>
    </div>
  );
}

function memberLabel(member: GroupMemberInfo): string {
  return member.username?.trim() || "Member";
}

function lastActiveLabel(member: GroupMemberInfo): string {
  if (!member.lastActiveAt) return "No activity yet";
  return formatRelativeTime(member.lastActiveAt);
}

interface StudyGroupsProps {
  /** Optional code from a `?join=CODE` link, prefills the join form. */
  initialJoinCode?: string | null;
}

export function StudyGroups({ initialJoinCode = null }: StudyGroupsProps) {
  const snapshot = useSyncExternalStore(
    subscribeGroups,
    getGroupSnapshot,
    getServerGroupSnapshot,
  );
  const signedIn = useSignedIn();
  const configured = isSupabaseConfigured();

  const [activeGroupId, setActiveGroupId] = useState<string | null>(null);
  const [form, setForm] = useState<"create" | "join" | null>(
    initialJoinCode ? "join" : null,
  );
  const [name, setName] = useState("");
  const [topic, setTopic] = useState("");
  const [pathRef, setPathRef] = useState("");
  const [code, setCode] = useState(initialJoinCode ?? "");
  const [formError, setFormError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [sendingTo, setSendingTo] = useState<string | null>(null);
  const [now, setNow] = useState(0);
  const nameRef = useRef<HTMLInputElement | null>(null);

  const selfId = useSyncExternalStore(
    subscribeIdentity,
    getIdentitySnapshot,
    getServerIdentity,
  );

  const activeGroup = useMemo(
    () =>
      activeGroupId
        ? (snapshot.groups.find((group) => group.id === activeGroupId) ?? null)
        : null,
    [snapshot.groups, activeGroupId],
  );

  const board: GroupLeaderboard | null = useMemo(
    () => (activeGroupId ? getGroupBoard(activeGroupId) : null),
    [snapshot, activeGroupId],
  );

  const activeNudges = useMemo(
    () =>
      activeGroupId
        ? snapshot.nudges.filter((nudge) => nudge.groupId === activeGroupId)
        : [],
    [snapshot.nudges, activeGroupId],
  );

  const incoming = useMemo(() => {
    return activeNudges.filter(
      (nudge) => nudge.toUser === selfId && !nudge.seen,
    );
  }, [activeNudges, selfId]);

  useEffect(() => {
    if (form === "create") nameRef.current?.focus();
  }, [form]);

  useEffect(() => {
    let cancelled = false;
    listMyGroups()
      .then((result) => {
        if (!cancelled) setNotice(result.error);
      })
      .catch(() => {});
    return () => {
      cancelled = true;
    };
  }, [signedIn]);

  useEffect(() => {
    if (!activeGroupId) return;
    let cancelled = false;
    Promise.all([
      getGroupLeaderboard(activeGroupId),
      listGroupNudges(activeGroupId),
    ])
      .then(([boardResult, nudgeResult]) => {
        if (!cancelled) setNotice(boardResult.error ?? nudgeResult.error);
      })
      .catch(() => {});
    const stopRealtime = subscribeRealtime({
      kind: "group",
      groupId: activeGroupId,
    });
    return () => {
      cancelled = true;
      stopRealtime();
    };
  }, [activeGroupId]);

  useEffect(() => {
    if (!activeGroupId) return;
    const tick = () => setNow(Date.now());
    const timeout = window.setTimeout(tick, 0);
    const timer = window.setInterval(tick, 30_000);
    return () => {
      window.clearTimeout(timeout);
      window.clearInterval(timer);
    };
  }, [activeGroupId]);

  const openGroup = (groupId: string) => {
    setNotice(null);
    setForm(null);
    setActiveGroupId(groupId);
  };

  const submitCreate = () => {
    const cleanName = name.trim();
    if (cleanName.length < 2) {
      setFormError("Give the group a name of at least 2 characters.");
      return;
    }
    setBusy(true);
    setFormError(null);
    void createGroup({ name: cleanName, topic, pathRef })
      .then((result) => {
        setBusy(false);
        if (result.error) setNotice(result.error);
        if (result.data) {
          setName("");
          setTopic("");
          setPathRef("");
          setForm(null);
          openGroup(result.data.id);
        }
      })
      .catch(() => setBusy(false));
  };

  const submitJoin = () => {
    const cleaned = code.trim();
    if (!cleaned) {
      setFormError("Enter the code someone shared with you.");
      return;
    }
    setBusy(true);
    setFormError(null);
    void joinGroup(cleaned)
      .then((result) => {
        setBusy(false);
        if (result.error) {
          setFormError(result.error);
          return;
        }
        if (result.data) {
          setCode("");
          setForm(null);
          openGroup(result.data.id);
        }
      })
      .catch(() => setBusy(false));
  };

  const onNudge = (member: GroupMemberInfo) => {
    if (!activeGroupId || sendingTo) return;
    setSendingTo(member.userId);
    void sendNudge(activeGroupId, member.userId)
      .then((result) => {
        setSendingTo(null);
        if (result.error) setNotice(result.error);
      })
      .catch(() => setSendingTo(null));
  };

  const onMarkSeen = (nudgeId: string) => {
    void markNudgeSeen(nudgeId).then((result) => {
      if (result.error) setNotice(result.error);
    });
  };

  const onLeave = (group: StudyGroup) => {
    const confirmed =
      typeof window === "undefined" ||
      window.confirm(`Leave “${group.name}”? You can rejoin with its code.`);
    if (!confirmed) return;
    void leaveGroup(group.id).then((result) => {
      if (result.error) {
        setNotice(result.error);
        return;
      }
      if (activeGroupId === group.id) setActiveGroupId(null);
    });
  };

  const copyCode = (group: StudyGroup) => {
    if (!group.joinCode) return;
    try {
      const clipboard = navigator.clipboard;
      if (clipboard?.writeText) {
        void clipboard
          .writeText(group.joinCode)
          .then(() => setNotice(`Copied code ${group.joinCode}.`))
          .catch(() => {});
      }
    } catch {
      /* clipboard unavailable — the code is visible on screen */
    }
  };

  const nameFor = (userId: string, fallback: "you" | "member" = "member"): string => {
    if (userId === selfId) return "you";
    const member = board?.members.find((item) => item.userId === userId);
    if (member) return memberLabel(member);
    if (fallback === "you") return "you";
    return "A group member";
  };

  const renderCreateForm = () => (
    <form
      className="df-slide-up mb-4 rounded-lg border border-hairline bg-canvas-card p-4 sm:p-5"
      aria-label="New study group"
      onSubmit={(event) => {
        event.preventDefault();
        submitCreate();
      }}
    >
      <div className="space-y-3">
        <div>
          <label
            htmlFor="df-group-name"
            className="mb-1 block text-[11px] font-medium text-body-mid"
          >
            Group name
          </label>
          <input
            id="df-group-name"
            ref={nameRef}
            type="text"
            value={name}
            maxLength={80}
            onChange={(event) => setName(event.target.value)}
            placeholder="e.g. Tuesday ML crew"
            className={FIELD_CLASSES}
          />
        </div>
        <div className="grid gap-3 sm:grid-cols-2">
          <div>
            <label
              htmlFor="df-group-topic"
              className="mb-1 block text-[11px] font-medium text-body-mid"
            >
              Topic (optional)
            </label>
            <input
              id="df-group-topic"
              type="text"
              value={topic}
              maxLength={60}
              onChange={(event) => setTopic(event.target.value)}
              placeholder="e.g. Neural networks"
              className={FIELD_CLASSES}
            />
          </div>
          <div>
            <label
              htmlFor="df-group-path"
              className="mb-1 block text-[11px] font-medium text-body-mid"
            >
              Path (optional)
            </label>
            <input
              id="df-group-path"
              type="text"
              value={pathRef}
              maxLength={120}
              onChange={(event) => setPathRef(event.target.value)}
              placeholder="e.g. ml-foundations"
              className={cn(FIELD_CLASSES, "font-mono text-xs")}
            />
          </div>
        </div>
      </div>
      {formError && (
        <p role="alert" className="mt-2 text-[11px] text-error">
          {formError}
        </p>
      )}
      {!signedIn && (
        <p className="mt-2 text-[11px] text-mute">
          {configured
            ? "Saved on this device. Sign in to create a group others can join."
            : "Saved on this device. Sync is not configured in this build."}
        </p>
      )}
      <div className="mt-4 flex flex-wrap items-center justify-end gap-2">
        <button
          type="button"
          onClick={() => {
            setForm(null);
            setFormError(null);
          }}
          className={SECONDARY_BUTTON_CLASSES}
        >
          Cancel
        </button>
        <button type="submit" disabled={busy} className={PRIMARY_BUTTON_CLASSES}>
          {busy ? "Creating…" : "Create group"}
        </button>
      </div>
    </form>
  );

  const renderJoinForm = () => (
    <form
      className="df-slide-up mb-4 rounded-lg border border-hairline bg-canvas-card p-4 sm:p-5"
      aria-label="Join a study group"
      onSubmit={(event) => {
        event.preventDefault();
        submitJoin();
      }}
    >
      <label
        htmlFor="df-group-code"
        className="mb-1 block text-[11px] font-medium text-body-mid"
      >
        Group code
      </label>
      <input
        id="df-group-code"
        type="text"
        value={code}
        maxLength={16}
        onChange={(event) => setCode(event.target.value.toUpperCase())}
        placeholder="ABCD2345"
        autoComplete="off"
        spellCheck={false}
        className={cn(FIELD_CLASSES, "font-mono uppercase tracking-wider")}
      />
      <p className="mt-1 text-[11px] text-mute">
        Codes are 8 letters and numbers, shared by a group member.
      </p>
      {formError && (
        <p role="alert" className="mt-2 text-[11px] text-error">
          {formError}
        </p>
      )}
      <div className="mt-4 flex flex-wrap items-center justify-end gap-2">
        <button
          type="button"
          onClick={() => {
            setForm(null);
            setFormError(null);
          }}
          className={SECONDARY_BUTTON_CLASSES}
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={busy || !signedIn}
          className={PRIMARY_BUTTON_CLASSES}
        >
          {busy ? "Joining…" : "Join group"}
        </button>
      </div>
      {!signedIn && (
        <p className="mt-2 text-[11px] text-mute">
          {configured
            ? "Sign in first — codes belong to the account, not this browser."
            : "Sync is not configured in this build, so codes can't be checked."}
        </p>
      )}
    </form>
  );

  const renderList = () => (
    <>
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <h3 className="text-sm font-semibold text-ink">Your groups</h3>
          <span
            className="rounded-full border border-hairline px-1.5 py-0.5 font-mono text-[10px] text-body-mid"
            aria-label={`${snapshot.groups.length} groups`}
          >
            {snapshot.groups.length}
          </span>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={() => {
              setForm(form === "create" ? null : "create");
              setFormError(null);
            }}
            aria-expanded={form === "create"}
            className={SECONDARY_BUTTON_CLASSES}
          >
            New group
          </button>
          <button
            type="button"
            onClick={() => {
              setForm(form === "join" ? null : "join");
              setFormError(null);
            }}
            aria-expanded={form === "join"}
            className={SECONDARY_BUTTON_CLASSES}
          >
            Join with code
          </button>
        </div>
      </div>

      {notice && (
        <p role="status" className="mb-3 text-[11px] text-body-mid">
          {notice}
        </p>
      )}

      {form === "create" && renderCreateForm()}
      {form === "join" && renderJoinForm()}

      {snapshot.groups.length === 0 ? (
        <div className="rounded-lg border border-dashed border-hairline bg-canvas-card px-4 py-10 text-center sm:py-12">
          <p className="text-sm font-medium text-ink">No groups yet</p>
          <p className="mx-auto mt-1 max-w-md text-xs leading-relaxed text-body-mid">
            A group is a small, shared place to practice. Everyone sees the same
            weekly board, the group streak needs every member, and a nudge is
            one tap. Create one and share its code, or enter a code someone
            sent you.
          </p>
          <div className="mt-4 flex flex-wrap items-center justify-center gap-2">
            <button
              type="button"
              onClick={() => {
                setForm("create");
                setFormError(null);
              }}
              className={PRIMARY_BUTTON_CLASSES}
            >
              Create a group
            </button>
            <button
              type="button"
              onClick={() => {
                setForm("join");
                setFormError(null);
              }}
              className={SECONDARY_BUTTON_CLASSES}
            >
              Join with a code
            </button>
          </div>
          <p className="mx-auto mt-4 max-w-md text-[11px] leading-relaxed text-mute">
            {signedIn
              ? "Only weekly counts and streaks are shared. Your solved problems and code stay on your device."
              : configured
                ? "Groups work on this device without an account. Sign in when you want to practice with other people."
                : "Groups work on this device. Sync is not configured in this build."}
          </p>
        </div>
      ) : (
        <ul className="space-y-3">
          {snapshot.groups.map((group) => {
            const groupBoard = getGroupBoard(group.id);
            const memberCount = groupBoard?.members.length ?? 1;
            const yourWeek =
              groupBoard?.members.find((member) => member.isYou)?.weeklySolved ?? 0;
            return (
              <li key={group.id}>
                <article className="rounded-lg border border-hairline bg-canvas-card p-4 transition-colors hover:border-accent/30 sm:p-5">
                  <div className="flex flex-wrap items-start justify-between gap-2">
                    <button
                      type="button"
                      onClick={() => openGroup(group.id)}
                      className="break-words rounded-sm text-left text-sm font-semibold text-ink transition-colors hover:text-accent focus:outline-none focus-visible:ring-2 focus-visible:ring-accent/40"
                    >
                      {group.name}
                    </button>
                    <span className={CHIP_CLASSES}>
                      {group.localOnly ? "This device" : `Code ${group.joinCode}`}
                    </span>
                  </div>
                  {(group.topic || group.pathRef) && (
                    <div className="mt-2 flex flex-wrap items-center gap-1.5">
                      {group.topic && <span className={CHIP_CLASSES}>{group.topic}</span>}
                      {group.pathRef && (
                        <span className={cn(CHIP_CLASSES, "font-mono")}>
                          {group.pathRef}
                        </span>
                      )}
                    </div>
                  )}
                  <dl className="mt-3 grid grid-cols-3 gap-3">
                    <GroupStat label="Members" value={String(memberCount)} />
                    <GroupStat label="Your week" value={`${yourWeek} solved`} />
                    <GroupStat
                      label="Group streak"
                      value={`${groupBoard?.groupStreak ?? 0} days`}
                    />
                  </dl>
                  <div className="mt-3">
                    <button
                      type="button"
                      onClick={() => openGroup(group.id)}
                      className={SECONDARY_BUTTON_CLASSES}
                    >
                      Open group
                    </button>
                  </div>
                </article>
              </li>
            );
          })}
        </ul>
      )}

      <details className="mt-5 rounded-lg border border-hairline bg-canvas-soft px-4 py-3 text-xs text-body-mid">
        <summary className="cursor-pointer text-[11px] font-medium text-ink">
          How groups work
        </summary>
        <ul className="mt-2 space-y-1.5 leading-relaxed">
          <li>
            The weekly board shares three numbers per member: problems solved
            this week, current streak, and last active. Problem ids and code
            never leave your device.
          </li>
          <li>
            The group streak follows the member with the shortest active streak,
            so one missed day pauses it for everyone.
          </li>
          <li>
            A nudge is a single row, not a message. You can send one per person
            every 12 hours.
          </li>
        </ul>
      </details>
    </>
  );

  const renderDetail = (group: StudyGroup, groupBoard: GroupLeaderboard | null) => {
    const rows = groupBoard?.members ?? [];
    return (
      <>
        <div className="flex flex-wrap items-center justify-between gap-2">
          <button
            type="button"
            onClick={() => setActiveGroupId(null)}
            className="inline-flex min-h-11 items-center gap-1 rounded-md text-xs text-body-mid transition-colors hover:text-ink focus:outline-none focus-visible:ring-2 focus-visible:ring-accent/40 sm:min-h-0"
          >
            <span aria-hidden>←</span>
            All groups
          </button>
          <button
            type="button"
            onClick={() => onLeave(group)}
            className="inline-flex min-h-11 items-center rounded-md border border-hairline px-3 py-0.5 text-[11px] text-body-mid transition-colors hover:bg-canvas-soft hover:text-error focus:outline-none focus-visible:ring-2 focus-visible:ring-accent/40 sm:min-h-0"
          >
            Leave group
          </button>
        </div>

        <div className="mt-3 rounded-lg border border-hairline bg-canvas-card p-4 sm:p-5">
          <h3 className="break-words text-base font-semibold text-ink">
            {group.name}
          </h3>
          <div className="mt-2 flex flex-wrap items-center gap-1.5">
            {group.topic && <span className={CHIP_CLASSES}>{group.topic}</span>}
            {group.pathRef && (
              <span className={cn(CHIP_CLASSES, "font-mono")}>{group.pathRef}</span>
            )}
            {group.localOnly ? (
              <span className={CHIP_CLASSES}>This device only</span>
            ) : (
              <button
                type="button"
                onClick={() => copyCode(group)}
                className={cn(
                  CHIP_CLASSES,
                  "transition-colors hover:border-accent/40 hover:text-accent focus:outline-none focus-visible:ring-2 focus-visible:ring-accent/40",
                )}
              >
                Code {group.joinCode} · copy
              </button>
            )}
          </div>
          {group.localOnly && (
            <p className="mt-2 text-[11px] leading-relaxed text-mute">
              This group lives in this browser. Sign in to make a group with a
              code other people can join.
            </p>
          )}

          <dl className="mt-4 grid grid-cols-2 gap-4 sm:grid-cols-3">
            <GroupStat label="Group streak" value={`${groupBoard?.groupStreak ?? 0} days`} />
            <GroupStat label="Members" value={String(rows.length)} />
            <GroupStat
              label="Active this week"
              value={String(groupBoard?.activeMembers ?? 0)}
            />
          </dl>
          <p className="mt-2 text-[11px] leading-relaxed text-mute">
            The group streak follows the shortest member streak — everyone has to
            show up for the group to advance.
          </p>
        </div>

        {notice && (
          <p role="status" className="mt-3 text-[11px] text-body-mid">
            {notice}
          </p>
        )}

        {incoming.length > 0 && (
          <div className="mt-3 rounded-lg border border-accent/30 bg-accent/5 p-4">
            <h4 className="text-xs font-semibold text-ink">Nudges for you</h4>
            <ul className="mt-2 space-y-2">
              {incoming.map((nudge) => (
                <li
                  key={nudge.id}
                  className="flex flex-wrap items-center justify-between gap-2 text-xs text-body-mid"
                >
                  <span>
                    {nameFor(nudge.fromUser, "you")} nudged you to practice.
                  </span>
                  <button
                    type="button"
                    onClick={() => onMarkSeen(nudge.id)}
                    className={SECONDARY_BUTTON_CLASSES}
                  >
                    Got it
                  </button>
                </li>
              ))}
            </ul>
          </div>
        )}

        <h4 className="mt-5 text-xs font-semibold text-ink">This week’s board</h4>
        <p className="mt-1 text-[11px] text-mute">
          Monday to today. Solved counts reset each week.
        </p>
        <ul className="mt-3 space-y-2">
          {rows.map((member, index) => {
            const cooldown =
              now > 0 && selfId && !member.isYou
                ? nudgeCooldownRemaining(
                    activeNudges,
                    group.id,
                    selfId,
                    member.userId,
                    now,
                  )
                : 0;
            const canNudge =
              !member.isYou && !group.localOnly && signedIn;
            return (
              <li
                key={member.userId}
                className="flex flex-wrap items-center gap-x-3 gap-y-2 rounded-lg border border-hairline bg-canvas-card px-3 py-2.5 sm:px-4"
              >
                <span className="w-5 shrink-0 font-mono text-[11px] text-mute">
                  {index + 1}
                </span>
                <span className="min-w-0 flex-1 break-words text-sm text-ink">
                  {memberLabel(member)}
                  {member.isYou && (
                    <span className="ml-1.5 rounded-full border border-accent/40 px-1.5 py-0.5 text-[10px] text-accent">
                      You
                    </span>
                  )}
                  {member.role === "owner" && (
                    <span className="ml-1.5 text-[10px] text-mute">owner</span>
                  )}
                </span>
                <span className="text-xs text-body-mid">
                  <span className="font-mono text-ink">{member.weeklySolved}</span>{" "}
                  this week
                </span>
                <span className="text-xs text-body-mid">
                  <span className="font-mono text-ink">{member.streak}</span> day
                  streak
                </span>
                <span className="text-[11px] text-mute">
                  {lastActiveLabel(member)}
                </span>
                {canNudge &&
                  (cooldown > 0 ? (
                    <span className="inline-flex min-h-11 items-center rounded-md border border-hairline px-2.5 text-[11px] text-mute sm:min-h-0">
                      Nudged · {formatNudgeCooldown(cooldown)}
                    </span>
                  ) : (
                    <button
                      type="button"
                      onClick={() => onNudge(member)}
                      disabled={sendingTo === member.userId}
                      aria-label={`Nudge ${memberLabel(member)}`}
                      className={SECONDARY_BUTTON_CLASSES}
                    >
                      {sendingTo === member.userId ? "Sending…" : "Nudge"}
                    </button>
                  ))}
              </li>
            );
          })}
        </ul>
        <p className="mt-3 text-[11px] leading-relaxed text-mute">
          A nudge is one tap, not a message. It appears in their group view, and
          you can send one per person every 12 hours.
        </p>
      </>
    );
  };

  return (
    <section aria-label="Study groups">
      {activeGroup
        ? renderDetail(activeGroup, board)
        : renderList()}
    </section>
  );
}
