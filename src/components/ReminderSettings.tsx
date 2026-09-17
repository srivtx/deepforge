"use client";

import { useEffect, useRef, useState } from "react";
import {
  getNotificationSupport,
  getReminderPrefs,
  REMINDERS_CHANGE_EVENT,
  requestNotificationPermission,
  setReminderPrefs,
  snoozeReminders,
  type NotificationSupport,
  type ReminderPrefs,
} from "@/lib/reminders";

interface ReminderSettingsProps {
  onClose: () => void;
}

const HOURS = Array.from({ length: 24 }, (_, hour) => hour);

function formatHour(hour: number): string {
  return `${String(hour).padStart(2, "0")}:00`;
}

function formatSnooze(iso: string | null, now = new Date()): string | null {
  if (!iso) return null;
  const until = new Date(iso);
  if (Number.isNaN(until.getTime()) || until.getTime() <= now.getTime()) {
    return null;
  }
  return until.toLocaleString(undefined, {
    weekday: "short",
    hour: "numeric",
    minute: "2-digit",
  });
}

interface ToggleRowProps {
  label: string;
  description: string;
  checked: boolean;
  disabled?: boolean;
  onChange: (checked: boolean) => void;
}

function ToggleRow({
  label,
  description,
  checked,
  disabled = false,
  onChange,
}: ToggleRowProps) {
  return (
    <label
      className={`flex cursor-pointer items-start justify-between gap-3 rounded-md border border-hairline bg-canvas px-3 py-2.5 transition-colors hover:bg-canvas-soft ${
        disabled ? "cursor-not-allowed opacity-50" : ""
      }`}
    >
      <span className="min-w-0">
        <span className="block text-xs font-medium text-ink">{label}</span>
        <span className="mt-0.5 block text-[11px] leading-relaxed text-body-mid">
          {description}
        </span>
      </span>
      <input
        type="checkbox"
        checked={checked}
        disabled={disabled}
        onChange={(event) => onChange(event.target.checked)}
        className="mt-0.5 h-4 w-4 shrink-0 rounded border-hairline focus:outline-none focus-visible:ring-1 focus-visible:ring-accent/40"
        style={{ accentColor: "var(--accent)" }}
      />
    </label>
  );
}

/**
 * Opt-in reminder surface. Reads and writes local-only prefs; all caps
 * (per-category daily, session warmup, quiet hours) are enforced in
 * `lib/reminders` so this panel only has to be honest about them.
 */
export function ReminderSettings({ onClose }: ReminderSettingsProps) {
  const panelRef = useRef<HTMLDivElement>(null);
  const [prefs, setPrefs] = useState<ReminderPrefs>(() => getReminderPrefs());
  const [support, setSupport] = useState<NotificationSupport>(() =>
    getNotificationSupport(),
  );

  useEffect(() => {
    panelRef.current?.focus();
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [onClose]);

  useEffect(() => {
    const refresh = () => setPrefs(getReminderPrefs());
    window.addEventListener(REMINDERS_CHANGE_EVENT, refresh);
    window.addEventListener("storage", refresh);
    return () => {
      window.removeEventListener(REMINDERS_CHANGE_EVENT, refresh);
      window.removeEventListener("storage", refresh);
    };
  }, []);

  const update = (patch: Partial<ReminderPrefs>) => {
    setPrefs(setReminderPrefs(patch));
  };

  const handlePermission = async () => {
    setSupport(await requestNotificationPermission());
  };

  const snoozedUntil = formatSnooze(prefs.snoozedUntil);
  const categoriesDisabled = !prefs.enabled;

  return (
    <div
      ref={panelRef}
      role="dialog"
      aria-label="Reminder settings"
      tabIndex={-1}
      className="pointer-events-auto flex max-h-[70vh] w-[min(21rem,calc(100vw-2rem))] flex-col overflow-y-auto rounded-lg border border-hairline bg-canvas-card p-4 text-xs text-ink shadow-xl focus:outline-none"
    >
      <div className="flex items-start justify-between gap-3">
        <div>
          <h2 className="text-sm font-semibold text-ink">Reminders</h2>
          <p className="mt-0.5 text-[11px] text-body-mid">
            Opt in to nudges from your own device. Off by default.
          </p>
        </div>
        <button
          type="button"
          onClick={onClose}
          aria-label="Close reminder settings"
          className="rounded-md border border-hairline px-2 py-1 text-[11px] text-body-mid transition-colors hover:bg-canvas-soft hover:text-ink focus:outline-none focus-visible:ring-1 focus-visible:ring-accent/40"
        >
          Close
        </button>
      </div>

      <div className="mt-3 flex flex-col gap-2">
        <ToggleRow
          label="Enable reminders"
          description="State-aware nudges while DeepForge is open in this browser."
          checked={prefs.enabled}
          onChange={(checked) => update({ enabled: checked })}
        />
        <ToggleRow
          label="Review due"
          description="When spaced reviews are waiting."
          checked={prefs.reviewDue}
          disabled={categoriesDisabled}
          onChange={(checked) => update({ reviewDue: checked })}
        />
        <ToggleRow
          label="Streak at risk"
          description="When your solve streak is about to slip."
          checked={prefs.streakAtRisk}
          disabled={categoriesDisabled}
          onChange={(checked) => update({ streakAtRisk: checked })}
        />
        <ToggleRow
          label="Weekly digest"
          description="A once-a-week summary of what you solved."
          checked={prefs.weeklyDigest}
          disabled={categoriesDisabled}
          onChange={(checked) => update({ weeklyDigest: checked })}
        />
      </div>

      <div className="mt-4 rounded-md border border-hairline bg-canvas px-3 py-2.5">
        <div className="flex items-center justify-between gap-2">
          <span className="text-xs font-medium text-ink">Quiet hours</span>
          {prefs.windowStartHour === prefs.windowEndHour && (
            <span className="text-[10px] text-body-mid">All day</span>
          )}
        </div>
        <div className="mt-2 flex items-center gap-2">
          <label
            htmlFor="reminder-window-start"
            className="text-[11px] text-body-mid"
          >
            From
          </label>
          <select
            id="reminder-window-start"
            value={prefs.windowStartHour}
            onChange={(event) =>
              update({ windowStartHour: Number(event.target.value) })
            }
            className="rounded-md border border-hairline bg-canvas-soft px-2 py-1 font-mono text-[11px] text-ink focus:outline-none focus-visible:ring-1 focus-visible:ring-accent/40"
          >
            {HOURS.map((hour) => (
              <option key={hour} value={hour}>
                {formatHour(hour)}
              </option>
            ))}
          </select>
          <label
            htmlFor="reminder-window-end"
            className="text-[11px] text-body-mid"
          >
            to
          </label>
          <select
            id="reminder-window-end"
            value={prefs.windowEndHour}
            onChange={(event) =>
              update({ windowEndHour: Number(event.target.value) })
            }
            className="rounded-md border border-hairline bg-canvas-soft px-2 py-1 font-mono text-[11px] text-ink focus:outline-none focus-visible:ring-1 focus-visible:ring-accent/40"
          >
            {HOURS.map((hour) => (
              <option key={hour} value={hour}>
                {formatHour(hour)}
              </option>
            ))}
          </select>
        </div>
        <p className="mt-2 text-[11px] leading-relaxed text-body-mid">
          Nothing fires outside this window. Equal times mean all day.
        </p>
      </div>

      <div className="mt-4 rounded-md border border-hairline bg-canvas px-3 py-2.5">
        <div className="flex items-center justify-between gap-2">
          <span className="text-xs font-medium text-ink">Device notifications</span>
          <span
            className={`text-[10px] ${
              support === "granted" ? "text-accent" : "text-body-mid"
            }`}
          >
            {support === "granted"
              ? "Allowed"
              : support === "denied"
                ? "Blocked"
                : support === "unsupported"
                  ? "Unavailable"
                  : "Ask first"}
          </span>
        </div>
        {support === "default" && (
          <button
            type="button"
            onClick={handlePermission}
            disabled={!prefs.enabled}
            className="mt-2 rounded-md bg-accent px-2.5 py-1 text-[11px] font-medium text-canvas transition-opacity hover:opacity-90 focus:outline-none focus-visible:ring-1 focus-visible:ring-accent/40 disabled:cursor-not-allowed disabled:opacity-50"
          >
            Allow notifications
          </button>
        )}
        <p className="mt-2 text-[11px] leading-relaxed text-body-mid">
          {support === "granted"
            ? "System notifications are on. Nudges fall back to in-app banners when a notification can't be shown."
            : support === "denied"
              ? "Notifications are blocked in this browser — nudges appear inside DeepForge instead."
              : support === "unsupported"
                ? "This browser has no notification support — nudges appear inside DeepForge instead."
                : "Allow only if you want nudges outside the tab; in-app banners work either way."}
        </p>
      </div>

      <p className="mt-4 text-[11px] leading-relaxed text-body-mid">
        Limits: one reminder per type per day, never in your first hour on the
        site, and only inside your quiet hours. Everything stays on this device
        — no account, no server, and it works offline.
      </p>

      <div className="mt-3 flex items-center justify-between gap-2">
        <button
          type="button"
          onClick={() => setPrefs(snoozeReminders())}
          disabled={snoozedUntil !== null}
          className="rounded-md border border-hairline px-2.5 py-1 text-[11px] text-body-mid transition-colors hover:bg-canvas-soft hover:text-ink focus:outline-none focus-visible:ring-1 focus-visible:ring-accent/40 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {snoozedUntil ? `Paused until ${snoozedUntil}` : "Snooze 24h"}
        </button>
        <span className="text-[10px] text-body-mid">Changes save instantly</span>
      </div>
    </div>
  );
}
