"use client";

import {
  useEffect,
  useRef,
  useState,
  useSyncExternalStore,
  type ReactNode,
} from "react";
import { cn } from "@/lib/utils";
import { getDailyDateKey } from "@/lib/daily";
import { getUserName, setUserName, validateUsername } from "@/lib/leaderboard";
import {
  getCachedSession,
  isSupabaseConfigured,
} from "@/lib/sync/backend";
import { loadRemoteSync } from "@/lib/sync/remoteLazy";
import { Avatar } from "@/components/Avatar";
import { AvatarPicker } from "@/components/AvatarPicker";
import { StreakCard } from "@/components/StreakCard";
import {
  BADGE_CATALOG,
  TOTAL_BADGES,
  computeXp,
  earnedBadges,
  getActivityHeatmap,
  getBadgeSnapshot,
  getDailyQuests,
  getTotals,
  type BadgeTier,
  type EarnedBadge,
  type HeatmapDay,
  type HeatmapLevel,
  type Quest,
  type Totals,
  type XpInfo,
} from "@/lib/badges";

/* ─────────────────────────────── profile store ──────────────────────────── */

interface ProfileData {
  name: string;
  xp: XpInfo;
  totals: Totals;
  earned: EarnedBadge[];
  quests: Quest[];
  heatmap: HeatmapDay[];
  badgeProgress: Record<string, [number, number]>;
}

const EMPTY_PROFILE: ProfileData = {
  name: "you",
  xp: { xp: 0, level: 1, title: "Novice", nextLevelXp: 100, progress: 0 },
  totals: { solved: 0, xp: 0, level: 1, badges: 0, streak: 0, longestStreak: 0 },
  earned: [],
  quests: [],
  heatmap: [],
  badgeProgress: {},
};

const PROFILE_EVENTS = [
  "deepforge:progress-change",
  "deepforge:daily-change",
  "deepforge:lab-change",
  "deepforge:research-change",
  "deepforge:contest-change",
  "deepforge:username-change",
];

let cached: ProfileData | null = null;

function buildProfile(): ProfileData {
  const snapshot = getBadgeSnapshot();
  const xp = computeXp(snapshot);
  const earned = earnedBadges(snapshot);
  const totals = getTotals(snapshot);
  return {
    name: getUserName(),
    xp,
    totals: { ...totals, xp: xp.xp, level: xp.level, badges: earned.length },
    earned,
    quests: getDailyQuests(snapshot),
    heatmap: getActivityHeatmap(52, snapshot),
    badgeProgress: Object.fromEntries(
      BADGE_CATALOG.map((badge) => [badge.id, badge.progress(snapshot)]),
    ),
  };
}

function getSnapshot(): ProfileData {
  if (!cached) cached = buildProfile();
  return cached;
}

function getServerSnapshot(): ProfileData {
  return EMPTY_PROFILE;
}

function subscribe(onStoreChange: () => void): () => void {
  const onChange = () => {
    cached = null;
    onStoreChange();
  };
  for (const event of PROFILE_EVENTS) window.addEventListener(event, onChange);
  window.addEventListener("storage", onChange);
  return () => {
    for (const event of PROFILE_EVENTS) {
      window.removeEventListener(event, onChange);
    }
    window.removeEventListener("storage", onChange);
  };
}

/* ─────────────────────── username remote (best effort) ──────────────────── */

const USERNAME_TAKEN_ERROR = "That username is taken — try another.";
const USERNAME_AVAILABLE_STATUS = "Available.";
const USERNAME_CHECKING_STATUS = "Checking availability…";
const USERNAME_OFFLINE_HINT = "Saved locally — will sync later";
const USERNAME_CHECK_DEBOUNCE_MS = 450;

interface RemoteProfileRow {
  id?: unknown;
  username?: unknown;
}

function canSyncUsername(): boolean {
  return isSupabaseConfigured() && getCachedSession() !== null;
}

/** Best-effort live availability check; "unknown" means the check didn't run. */
async function checkUsernameRemote(
  name: string,
): Promise<"available" | "taken" | "unknown"> {
  try {
    const remote = await loadRemoteSync();
    const client = await remote.getRemoteClient();
    const session = getCachedSession();
    if (!client || !session) return "unknown";
    const { data, error } = await client
      .from("profiles")
      .select("id")
      .eq("username", name)
      .maybeSingle();
    if (error) return "unknown";
    if (!data) return "available";
    const ownerId = (data as RemoteProfileRow).id;
    if (typeof ownerId !== "string" || ownerId.length === 0) return "unknown";
    return ownerId === session.userId ? "available" : "taken";
  } catch {
    return "unknown";
  }
}

/**
 * Persist the username to `profiles.username` for the signed-in user.
 * Never throws: network problems report "offline" so the local value wins.
 */
async function syncUsernameRemote(
  name: string,
): Promise<"ok" | "taken" | "offline"> {
  try {
    const remote = await loadRemoteSync();
    const client = await remote.getRemoteClient();
    const session = getCachedSession();
    if (!client || !session) return "offline";
    const { data, error: readError } = await client
      .from("profiles")
      .select("id")
      .eq("username", name)
      .maybeSingle();
    if (!readError && data) {
      const ownerId = (data as RemoteProfileRow).id;
      if (typeof ownerId === "string" && ownerId !== session.userId) {
        return "taken";
      }
    }
    const { error } = await client
      .from("profiles")
      .update({ username: name, updated_at: new Date().toISOString() })
      .eq("id", session.userId);
    if (error) return error.code === "23505" ? "taken" : "offline";
    return "ok";
  } catch {
    return "offline";
  }
}

/* ──────────────────────────────── helpers ───────────────────────────────── */

const TIER_CLASSES: Record<BadgeTier, string> = {
  bronze: "border-hairline bg-canvas-soft text-body-mid",
  silver: "border-info/40 bg-info/5 text-info",
  gold: "border-warning/40 bg-warning/5 text-warning",
};

const HEAT_CLASSES = [
  "bg-canvas-soft",
  "bg-accent/20",
  "bg-accent/40",
  "bg-accent/65",
  "bg-accent/90",
];

function formatEarnedAt(iso: string | null): string | null {
  if (!iso) return null;
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return null;
  return date.toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

const GLYPHS: ReactNode[] = [
  <path key="bolt" d="M9 1 3 9h4l-1 6 6-8H8l1-6Z" />,
  <path
    key="star"
    d="M8 1.5l1.9 3.9 4.3.6-3.1 3 .7 4.3L8 11.3l-3.8 2 .7-4.3-3.1-3 4.3-.6L8 1.5Z"
  />,
  <path
    key="shield"
    d="M8 1.5 13 3.4v4c0 3.2-2.1 5.4-5 7.1-2.9-1.7-5-3.9-5-7.1v-4l5-1.9Z"
  />,
  <path
    key="flask"
    d="M6 1.5h4M7 1.5v4.2L3.4 12a1.6 1.6 0 0 0 1.4 2.5h6.4A1.6 1.6 0 0 0 12.6 12L9 5.7V1.5"
  />,
  <g key="target">
    <circle cx="8" cy="8" r="6" />
    <circle cx="8" cy="8" r="2.5" />
  </g>,
  <g key="clock">
    <circle cx="8" cy="8" r="6" />
    <path d="M8 4.5V8l2.5 1.8" />
  </g>,
  <path key="diamond" d="M8 1.5 14 8l-6 6.5L2 8l6-6.5Z" />,
  <path key="layers" d="M8 1.8 2 5l6 3.2L14 5 8 1.8ZM2 9l6 3.2L14 9" />,
];

function glyphIndex(id: string): number {
  let sum = 0;
  for (let i = 0; i < id.length; i += 1) sum += id.charCodeAt(i);
  return sum % GLYPHS.length;
}

function BadgeGlyph({ id }: { id: string }) {
  return (
    <svg
      width="16"
      height="16"
      viewBox="0 0 16 16"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.3"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
    >
      {GLYPHS[glyphIndex(id)]}
    </svg>
  );
}

function ProgressBar({
  value,
  max,
  label,
}: {
  value: number;
  max: number;
  label: string;
}) {
  const safeMax = Math.max(1, max);
  const clamped = Math.max(0, Math.min(value, safeMax));
  const percent = Math.round((clamped / safeMax) * 100);
  return (
    <div
      role="progressbar"
      aria-label={label}
      aria-valuemin={0}
      aria-valuemax={safeMax}
      aria-valuenow={clamped}
      className="h-1.5 overflow-hidden rounded-full bg-canvas-soft"
    >
      <div
        className="h-full rounded-full bg-accent transition-[width]"
        style={{ width: `${percent}%` }}
      />
    </div>
  );
}

function LevelRing({ level, progress }: { level: number; progress: number }) {
  const size = 64;
  const stroke = 4;
  const radius = (size - stroke) / 2;
  const circumference = 2 * Math.PI * radius;
  const clamped = Math.max(0, Math.min(1, progress));
  return (
    <svg
      width={size}
      height={size}
      viewBox={`0 0 ${size} ${size}`}
      aria-hidden
      className="shrink-0"
    >
      <circle
        cx={size / 2}
        cy={size / 2}
        r={radius}
        fill="none"
        stroke="currentColor"
        strokeWidth={stroke}
        className="text-canvas-soft"
      />
      <circle
        cx={size / 2}
        cy={size / 2}
        r={radius}
        fill="none"
        stroke="currentColor"
        strokeWidth={stroke}
        strokeLinecap="round"
        strokeDasharray={circumference}
        strokeDashoffset={circumference * (1 - clamped)}
        transform={`rotate(-90 ${size / 2} ${size / 2})`}
        className="text-accent"
      />
      <text
        x="50%"
        y="50%"
        dominantBaseline="central"
        textAnchor="middle"
        fill="currentColor"
        className="fill-ink text-lg font-semibold"
      >
        {level}
      </text>
    </svg>
  );
}

function QuestCheck({ done }: { done: boolean }) {
  return (
    <span
      className={cn(
        "flex h-4 w-4 shrink-0 items-center justify-center rounded-full",
        done ? "bg-accent/15 text-accent" : "border border-hairline text-mute",
      )}
      aria-hidden
    >
      {done && (
        <svg width="10" height="10" viewBox="0 0 10 10" fill="none">
          <path
            d="M2 5l2 2 4-4"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      )}
    </span>
  );
}

/* ─────────────────────────────── component ──────────────────────────────── */

export function Badges() {
  const profile = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
  const [editingName, setEditingName] = useState(false);
  const [nameDraft, setNameDraft] = useState("");
  const [nameTaken, setNameTaken] = useState<string | null>(null);
  const [nameNotice, setNameNotice] = useState<{
    name: string;
    text: string;
  } | null>(null);
  const [savingName, setSavingName] = useState(false);
  const [savedLocally, setSavedLocally] = useState(false);
  const nameCheckId = useRef(0);
  const nameCheckTimer = useRef<number | null>(null);

  const cancelPendingCheck = () => {
    nameCheckId.current += 1;
    if (nameCheckTimer.current !== null) {
      window.clearTimeout(nameCheckTimer.current);
      nameCheckTimer.current = null;
    }
  };

  useEffect(() => cancelPendingCheck, []);

  const scheduleAvailabilityCheck = (name: string) => {
    cancelPendingCheck();
    if (!canSyncUsername()) {
      setNameNotice(null);
      return;
    }
    const checkId = nameCheckId.current;
    setNameNotice({ name, text: USERNAME_CHECKING_STATUS });
    nameCheckTimer.current = window.setTimeout(() => {
      nameCheckTimer.current = null;
      void checkUsernameRemote(name).then((outcome) => {
        if (nameCheckId.current !== checkId) return;
        if (outcome === "taken") {
          setNameTaken(name);
          setNameNotice(null);
          return;
        }
        setNameNotice(
          outcome === "available"
            ? { name, text: USERNAME_AVAILABLE_STATUS }
            : null,
        );
      });
    }, USERNAME_CHECK_DEBOUNCE_MS);
  };

  // Live validation: messages derive from the draft during render; the
  // debounced remote availability check runs from the change handler.
  const handleDraftChange = (raw: string) => {
    setNameDraft(raw);
    const value = validateUsername(raw).value;
    if (nameTaken !== null && nameTaken !== value) setNameTaken(null);
    if (!value || value === profile.name || nameTaken === value) {
      cancelPendingCheck();
      setNameNotice(null);
      return;
    }
    scheduleAvailabilityCheck(value);
  };

  const closeNameEditor = () => {
    cancelPendingCheck();
    setNameTaken(null);
    setNameNotice(null);
    setEditingName(false);
  };

  const startEditingName = () => {
    setNameDraft(profile.name);
    setSavedLocally(false);
    setNameTaken(null);
    setNameNotice(null);
    setEditingName(true);
  };

  const saveName = async () => {
    if (savingName) return;
    const result = validateUsername(nameDraft);
    if (!result.value) {
      setNameTaken(null);
      setNameNotice(null);
      return;
    }
    const next = result.value;
    const previous = profile.name;
    if (next === previous) {
      closeNameEditor();
      return;
    }
    cancelPendingCheck();
    setNameTaken(null);
    setNameNotice(null);
    setUserName(next);
    setSavedLocally(false);
    if (!canSyncUsername()) {
      closeNameEditor();
      return;
    }
    setSavingName(true);
    const outcome = await syncUsernameRemote(next);
    setSavingName(false);
    if (outcome === "taken") {
      setNameTaken(next);
      setUserName(previous);
      return;
    }
    if (outcome === "offline") {
      closeNameEditor();
      setSavedLocally(true);
      return;
    }
    closeNameEditor();
  };

  const validation = editingName ? validateUsername(nameDraft) : null;
  const nameError =
    validation?.error ??
    (validation?.value && validation.value === nameTaken
      ? USERNAME_TAKEN_ERROR
      : null);
  const nameStatus =
    nameNotice && validation?.value === nameNotice.name
      ? nameNotice.text
      : null;

  const earnedIds = new Set(profile.earned.map((badge) => badge.id));
  const earnedAtById = new Map(
    profile.earned.map((badge) => [badge.id, badge.earnedAt]),
  );
  const todayKey = getDailyDateKey(new Date());
  const completedQuests = profile.quests.filter((quest) => quest.done).length;

  return (
    <section
      id="profile"
      className="mx-auto w-full max-w-6xl scroll-mt-16 px-4 py-8 sm:px-6 sm:py-12"
    >
      {/* Profile header: identity + streak */}
      <div className="grid grid-cols-1 gap-3 lg:grid-cols-3">
        <div className="rounded-lg border border-hairline bg-canvas-card p-4 sm:p-5 lg:col-span-2">
          <div className="flex items-center gap-4 sm:gap-5">
            <Avatar size="xl" label={`${profile.name} avatar`} />
            <div className="min-w-0 flex-1">
              <h2 className="text-lg font-semibold tracking-tight text-ink">
                Profile
              </h2>
              {editingName ? (
                <form
                  className="mt-1"
                  onSubmit={(event) => {
                    event.preventDefault();
                    void saveName();
                  }}
                  onKeyDown={(event) => {
                    if (event.key === "Escape") {
                      event.preventDefault();
                      closeNameEditor();
                    }
                  }}
                >
                  <div className="flex flex-wrap items-center gap-2">
                    <input
                      autoFocus
                      type="text"
                      value={nameDraft}
                      maxLength={24}
                      readOnly={savingName}
                      onChange={(event) => handleDraftChange(event.target.value)}
                      aria-label="Username"
                      aria-invalid={nameError ? true : undefined}
                      aria-describedby={
                        nameError || nameStatus ? "username-feedback" : undefined
                      }
                      placeholder="3–24 characters"
                      className={cn(
                        "min-h-11 w-full max-w-56 rounded-lg border border-hairline bg-canvas px-3 text-sm text-ink transition-colors focus:border-accent/50 focus:outline-none focus:ring-1 focus:ring-accent/40 sm:min-h-9",
                        nameError && "border-error/50",
                      )}
                    />
                    <button
                      type="submit"
                      disabled={savingName}
                      className="inline-flex min-h-11 items-center rounded-lg border border-accent/40 bg-accent/5 px-3 text-xs font-medium text-accent transition-colors hover:bg-accent/10 focus:outline-none focus-visible:ring-1 focus-visible:ring-accent/40 disabled:pointer-events-none disabled:opacity-60 sm:min-h-0 sm:py-1.5"
                    >
                      {savingName ? "Saving…" : "Save"}
                    </button>
                    <button
                      type="button"
                      onClick={closeNameEditor}
                      className="inline-flex min-h-11 items-center rounded-lg border border-hairline px-3 text-xs text-body-mid transition-colors hover:bg-canvas-soft hover:text-ink focus:outline-none focus-visible:ring-1 focus-visible:ring-accent/40 sm:min-h-0 sm:py-1.5"
                    >
                      Cancel
                    </button>
                  </div>
                  {(nameError || nameStatus) && (
                    <p
                      id="username-feedback"
                      role={nameError ? "alert" : "status"}
                      className={cn(
                        "mt-1.5 text-xs",
                        nameError ? "text-error" : "text-body-mid",
                      )}
                    >
                      {nameError ?? nameStatus}
                    </p>
                  )}
                </form>
              ) : (
                <>
                  <div className="mt-1 flex flex-wrap items-center gap-2">
                    <span className="truncate text-base font-medium text-ink">
                      {profile.name}
                    </span>
                    <button
                      type="button"
                      onClick={startEditingName}
                      aria-label={`Edit username, currently ${profile.name}`}
                      className="inline-flex min-h-11 items-center rounded-lg border border-hairline px-3 text-xs text-body-mid transition-colors hover:bg-canvas-soft hover:text-ink focus:outline-none focus-visible:ring-1 focus-visible:ring-accent/40 sm:min-h-0 sm:py-1.5"
                    >
                      Edit
                    </button>
                  </div>
                  {savedLocally && (
                    <p role="status" className="mt-1 text-xs text-body-mid">
                      {USERNAME_OFFLINE_HINT}
                    </p>
                  )}
                </>
              )}
              <p className="mt-1.5 text-xs text-body-mid">
                {profile.earned.length}/{TOTAL_BADGES} badges · level{" "}
                {profile.xp.level} {profile.xp.title} · {completedQuests}/3
                quests today
              </p>
            </div>
          </div>
        </div>
        <StreakCard />
      </div>

      {/* Your look */}
      <div className="mt-3">
        <AvatarPicker />
      </div>

      <div className="mt-6 grid grid-cols-1 gap-3 lg:grid-cols-3">
        {/* Level + XP */}
        <div className="rounded-lg border border-hairline bg-canvas-card p-4 sm:p-5">
          <div className="flex items-center gap-4">
            <LevelRing level={profile.xp.level} progress={profile.xp.progress} />
            <div className="min-w-0">
              <div className="text-xs text-body-mid">
                Level {profile.xp.level}
              </div>
              <div className="truncate text-lg font-semibold text-ink">
                {profile.xp.title}
              </div>
              <div className="mt-0.5 font-mono text-xs text-body-mid">
                {profile.xp.xp} XP ·{" "}
                {Math.max(0, profile.xp.nextLevelXp - profile.xp.xp)} to level{" "}
                {profile.xp.level + 1}
              </div>
            </div>
          </div>
          <div className="mt-4">
            <div className="mb-1.5 flex items-center justify-between text-[10px] text-body-mid">
              <span>Level {profile.xp.level}</span>
              <span>Level {profile.xp.level + 1}</span>
            </div>
            <ProgressBar
              value={profile.xp.xp}
              max={profile.xp.nextLevelXp}
              label="Level progress"
            />
          </div>
        </div>

        {/* Totals */}
        <div className="rounded-lg border border-hairline bg-canvas-card p-4 sm:p-5">
          <h3 className="text-sm font-medium text-ink">Totals</h3>
          <div className="mt-4 grid grid-cols-2 gap-3">
            <div className="rounded-lg border border-hairline bg-canvas p-4">
              <div className="text-xs text-body-mid">Solved</div>
              <div className="mt-0.5 font-mono text-lg font-medium text-ink">
                {profile.totals.solved}
              </div>
            </div>
            <div className="rounded-lg border border-hairline bg-canvas p-4">
              <div className="text-xs text-body-mid">Badges</div>
              <div className="mt-0.5 font-mono text-lg font-medium text-accent">
                {profile.totals.badges}
                <span className="text-xs text-body-mid">/{TOTAL_BADGES}</span>
              </div>
            </div>
            <div className="rounded-lg border border-hairline bg-canvas p-4">
              <div className="text-xs text-body-mid">Streak</div>
              <div className="mt-0.5 font-mono text-lg font-medium text-ink">
                {profile.totals.streak}d
              </div>
            </div>
            <div className="rounded-lg border border-hairline bg-canvas p-4">
              <div className="text-xs text-body-mid">Longest</div>
              <div className="mt-0.5 font-mono text-lg font-medium text-ink">
                {profile.totals.longestStreak}d
              </div>
            </div>
          </div>
        </div>

        {/* Daily quests */}
        <div className="rounded-lg border border-hairline bg-canvas-card p-4 sm:p-5">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-medium text-ink">Daily quests</h3>
            <span className="font-mono text-[10px] text-body-mid">
              {completedQuests}/3
            </span>
          </div>
          <ul className="mt-4 space-y-3">
            {profile.quests.length === 0 ? (
              <li className="rounded-lg border border-hairline bg-canvas p-4 text-xs text-body-mid">
                Quests unlock once your local progress loads.
              </li>
            ) : (
              profile.quests.map((quest) => (
                <li
                  key={quest.id}
                  className="rounded-lg border border-hairline bg-canvas p-4"
                >
                  <div className="flex items-center gap-2">
                    <QuestCheck done={quest.done} />
                    <div className="min-w-0 flex-1">
                      <div className="truncate text-sm text-ink">
                        {quest.label}
                      </div>
                      <div className="truncate text-[10px] text-body-mid">
                        {quest.detail}
                      </div>
                    </div>
                    <span className="shrink-0 font-mono text-xs text-body-mid">
                      {quest.progress}/{quest.target}
                    </span>
                  </div>
                  <div className="mt-2">
                    <ProgressBar
                      value={quest.progress}
                      max={quest.target}
                      label={`${quest.label} progress`}
                    />
                  </div>
                </li>
              ))
            )}
          </ul>
        </div>
      </div>

      {/* Activity heatmap */}
      <div className="mt-10">
        <div className="mb-4 flex flex-wrap items-end justify-between gap-2">
          <div>
            <h3 className="text-base font-semibold text-ink">Activity</h3>
            <p className="mt-0.5 text-xs text-body-mid">
              Last 52 weeks — solves, dailies, and research runs.
            </p>
          </div>
          <div className="flex items-center gap-1.5 text-[10px] text-body-mid">
            <span>Less</span>
            {[0, 1, 2, 3, 4].map((level) => (
              <span
                key={level}
                aria-hidden
                className={cn(
                  "h-3 w-3 rounded-[3px]",
                  HEAT_CLASSES[level],
                )}
              />
            ))}
            <span>More</span>
          </div>
        </div>
        <div className="df-scroll overflow-x-auto rounded-lg border border-hairline bg-canvas-card p-4 sm:p-5">
          {profile.heatmap.length === 0 ? (
            <div className="h-3 w-3 rounded-[3px] bg-canvas-soft" aria-hidden />
          ) : (
            <div
              className="grid w-max gap-[3px]"
              style={{
                gridAutoFlow: "column",
                gridTemplateRows: "repeat(7, 12px)",
                gridAutoColumns: "12px",
              }}
            >
              {profile.heatmap.map((day) => {
                const future = day.date > todayKey;
                const label = `${day.count} ${
                  day.count === 1 ? "activity" : "activities"
                } on ${day.date}`;
                return (
                  <div
                    key={day.date}
                    role="img"
                    aria-label={future ? `${day.date} — upcoming` : label}
                    title={future ? day.date : label}
                    className={cn(
                      "h-3 w-3 rounded-[3px]",
                      HEAT_CLASSES[day.level as HeatmapLevel],
                      future && "opacity-40",
                    )}
                  />
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* Badge grid */}
      <div className="mt-10">
        <div className="mb-4">
          <h3 className="text-base font-semibold text-ink">All badges</h3>
          <p className="mt-0.5 text-xs text-body-mid">
            {profile.earned.length} of {TOTAL_BADGES} earned
          </p>
        </div>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {BADGE_CATALOG.map((badge) => {
            const earned = earnedIds.has(badge.id);
            const [current, target] = profile.badgeProgress[badge.id] ?? [0, 0];
            const earnedAt = formatEarnedAt(earnedAtById.get(badge.id) ?? null);
            const showBar = !earned && target > 0;
            return (
              <div
                key={badge.id}
                className={cn(
                  "flex flex-col gap-3 rounded-lg border p-4 sm:p-5",
                  earned
                    ? "border-accent/50 bg-accent/5"
                    : "border-hairline bg-canvas-card",
                )}
              >
                <div className="flex items-start gap-3">
                  <span
                    className={cn(
                      "flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border",
                      TIER_CLASSES[badge.tier],
                      !earned && "opacity-50",
                    )}
                  >
                    <BadgeGlyph id={badge.id} />
                  </span>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <h4 className="truncate text-sm font-medium text-ink">
                        {badge.name}
                      </h4>
                      {earned && (
                        <span className="shrink-0 text-[10px] font-medium text-accent">
                          Earned
                        </span>
                      )}
                    </div>
                    <p className="mt-1 text-xs leading-relaxed text-body-mid">
                      {badge.description}
                    </p>
                  </div>
                </div>
                {showBar && (
                  <div>
                    <div className="mb-1 flex items-center justify-between text-[10px] text-body-mid">
                      <span>Progress</span>
                      <span className="font-mono">
                        {current}/{target}
                      </span>
                    </div>
                    <ProgressBar
                      value={current}
                      max={target}
                      label={`${badge.name} progress`}
                    />
                  </div>
                )}
                <div className="mt-auto flex items-center justify-between gap-2">
                  <span
                    className={cn(
                      "rounded-full border px-1.5 py-0.5 text-[10px] font-medium capitalize",
                      TIER_CLASSES[badge.tier],
                    )}
                  >
                    {badge.tier}
                  </span>
                  {earned && earnedAt && (
                    <span className="text-[10px] text-body-mid">
                      {earnedAt}
                    </span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
