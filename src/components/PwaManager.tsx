"use client";

import { useEffect, useRef, useState, useSyncExternalStore } from "react";
import { useRouter } from "next/navigation";
import { ReminderSettings } from "@/components/ReminderSettings";
import {
  dispatchReminders,
  getReminderPrefs,
  recordEngagement,
  REMINDER_CHECK_INTERVAL_MS,
  REMINDER_EVENT,
  REMINDERS_CHANGE_EVENT,
  snoozeReminders,
  startReminderSession,
  type Reminder,
} from "@/lib/reminders";

/**
 * Client-side PWA glue: registers the service worker, surfaces the browser
 * install prompt, shows an offline status chip, offers an "update available"
 * prompt when a new worker is waiting, and nudges iOS Safari users toward Add
 * to Home Screen. Mounted once near the root of the app.
 *
 * All browser state is read through `useSyncExternalStore` so the server
 * snapshot is stable and hydration never mismatches.
 */

interface BeforeInstallPromptEvent extends Event {
  readonly platforms: readonly string[];
  readonly userChoice: Promise<{
    outcome: "accepted" | "dismissed";
    platform: string;
  }>;
  prompt: () => Promise<void>;
}

const IOS_HINT_KEY = "deepforge:pwa-hint-dismissed";
const IOS_HINT_EVENT = "deepforge:pwa-hint-dismissed";

const LOCAL_HOSTNAMES = ["localhost", "127.0.0.1", "0.0.0.0"];

function isLocalHostname(): boolean {
  return LOCAL_HOSTNAMES.includes(window.location.hostname);
}

function isStandaloneDisplay(): boolean {
  const iosNavigator = navigator as Navigator & { standalone?: boolean };
  return (
    iosNavigator.standalone === true ||
    window.matchMedia("(display-mode: standalone)").matches
  );
}

function isIosSafari(): boolean {
  const ua = navigator.userAgent;
  const isIos =
    /iPad|iPhone|iPod/.test(ua) ||
    (navigator.platform === "MacIntel" && navigator.maxTouchPoints > 1);
  if (!isIos) return false;
  return (
    /Safari/.test(ua) &&
    !/(CriOS|FxiOS|EdgiOS|OPiOS|DuckDuckGo|Mercury)/i.test(ua)
  );
}

function isIosHintDismissed(): boolean {
  try {
    return window.localStorage.getItem(IOS_HINT_KEY) === "1";
  } catch {
    return true;
  }
}

function subscribeInstalled(onChange: () => void): () => void {
  const displayMode = window.matchMedia("(display-mode: standalone)");
  window.addEventListener("appinstalled", onChange);
  displayMode.addEventListener("change", onChange);
  return () => {
    window.removeEventListener("appinstalled", onChange);
    displayMode.removeEventListener("change", onChange);
  };
}

function getInstalledSnapshot(): boolean {
  return isStandaloneDisplay();
}

function getInstalledServerSnapshot(): boolean {
  return false;
}

function subscribeOnline(onChange: () => void): () => void {
  window.addEventListener("online", onChange);
  window.addEventListener("offline", onChange);
  return () => {
    window.removeEventListener("online", onChange);
    window.removeEventListener("offline", onChange);
  };
}

function getOnlineSnapshot(): boolean {
  return navigator.onLine;
}

function getOnlineServerSnapshot(): boolean {
  return true;
}

function subscribeIosHint(onChange: () => void): () => void {
  window.addEventListener(IOS_HINT_EVENT, onChange);
  window.addEventListener("storage", onChange);
  return () => {
    window.removeEventListener(IOS_HINT_EVENT, onChange);
    window.removeEventListener("storage", onChange);
  };
}

function getIosHintSnapshot(): boolean {
  return !isStandaloneDisplay() && isIosSafari() && !isIosHintDismissed();
}

function getIosHintServerSnapshot(): boolean {
  return false;
}

function BellGlyph() {
  return (
    <svg
      width="15"
      height="15"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
    >
      <path d="M18 8a6 6 0 0 0-12 0c0 7-3 9-3 9h18s-3-2-3-9" />
      <path d="M13.7 21a2 2 0 0 1-3.4 0" />
    </svg>
  );
}

export function PwaManager() {
  const router = useRouter();
  const installed = useSyncExternalStore(
    subscribeInstalled,
    getInstalledSnapshot,
    getInstalledServerSnapshot,
  );
  const online = useSyncExternalStore(
    subscribeOnline,
    getOnlineSnapshot,
    getOnlineServerSnapshot,
  );
  const shouldShowIosHint = useSyncExternalStore(
    subscribeIosHint,
    getIosHintSnapshot,
    getIosHintServerSnapshot,
  );

  const [installEvent, setInstallEvent] =
    useState<BeforeInstallPromptEvent | null>(null);
  const [installDismissed, setInstallDismissed] = useState(false);
  const [updateReady, setUpdateReady] = useState(false);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [remindersEnabled, setRemindersEnabled] = useState(false);
  const [inAppReminder, setInAppReminder] = useState<Reminder | null>(null);

  const waitingWorkerRef = useRef<ServiceWorker | null>(null);
  // True only after the user asks to apply an update — guards the
  // controllerchange reload so a first install (clients.claim) never reloads.
  const applyRequestedRef = useRef(false);

  // Register the worker in production only, and never on localhost: a stale
  // worker serving immutable-looking chunks cache-first is the exact bug the
  // dev self-heal below exists to repair. A waiting worker means an update is
  // installed but held back; surface it instead of swapping it silently.
  useEffect(() => {
    if (process.env.NODE_ENV !== "production") return;
    if (isLocalHostname()) return;
    if (typeof navigator === "undefined" || !("serviceWorker" in navigator)) {
      return;
    }

    let cancelled = false;

    const revealWaiting = (registration: ServiceWorkerRegistration) => {
      if (cancelled || !registration.waiting) return;
      // No controller means this is a first install, not an update.
      if (!navigator.serviceWorker.controller) return;
      waitingWorkerRef.current = registration.waiting;
      setUpdateReady(true);
    };

    navigator.serviceWorker
      .register("/sw.js", { scope: "/" })
      .then((registration) => {
        if (cancelled) return;
        revealWaiting(registration);
        registration.addEventListener("updatefound", () => {
          const installing = registration.installing;
          if (!installing) return;
          installing.addEventListener("statechange", () => {
            if (installing.state === "installed") revealWaiting(registration);
          });
        });
        // Ask the browser to check for a newer worker now so the prompt is
        // timely rather than only on the next navigation.
        registration.update().catch(() => {});
      })
      .catch(() => {
        // Best-effort: the app works fine without an active service worker.
      });

    return () => {
      cancelled = true;
    };
  }, []);

  // Dev / localhost self-heal: remove any service worker and cached build
  // output left behind by earlier runs (for example a production build served
  // on localhost). A stale worker serves immutable-looking chunk URLs
  // cache-first, which shows up as stale CSS after state changes until a hard
  // refresh. Registrations are empty in a clean browser, so this is a no-op.
  useEffect(() => {
    if (process.env.NODE_ENV === "production" && !isLocalHostname()) return;
    if (!("serviceWorker" in navigator)) return;
    void (async () => {
      try {
        const registrations = await navigator.serviceWorker.getRegistrations();
        if (registrations.length === 0) return;
        const controlled = Boolean(navigator.serviceWorker.controller);
        await Promise.all(registrations.map((r) => r.unregister()));
        if ("caches" in window) {
          const keys = await caches.keys();
          await Promise.all(
            keys
              .filter((key) => key.startsWith("deepforge-"))
              .map((key) => caches.delete(key)),
          );
        }
        if (controlled) window.location.reload();
      } catch {
        // Best-effort cleanup only.
      }
    })();
  }, []);

  // Reload exactly once after the promoted worker takes control. The refs
  // keep first installs and duplicate events from triggering a reload loop.
  useEffect(() => {
    if (typeof navigator === "undefined" || !("serviceWorker" in navigator)) {
      return;
    }
    let reloading = false;
    const onControllerChange = () => {
      if (reloading || !applyRequestedRef.current) return;
      reloading = true;
      window.location.reload();
    };
    navigator.serviceWorker.addEventListener(
      "controllerchange",
      onControllerChange,
    );
    return () =>
      navigator.serviceWorker.removeEventListener(
        "controllerchange",
        onControllerChange,
      );
  }, []);

  useEffect(() => {
    const onBeforeInstallPrompt = (event: Event) => {
      event.preventDefault();
      setInstallEvent(event as BeforeInstallPromptEvent);
    };
    const onAppInstalled = () => setInstallEvent(null);
    window.addEventListener("beforeinstallprompt", onBeforeInstallPrompt);
    window.addEventListener("appinstalled", onAppInstalled);
    return () => {
      window.removeEventListener("beforeinstallprompt", onBeforeInstallPrompt);
      window.removeEventListener("appinstalled", onAppInstalled);
    };
  }, []);

  // Reminder engine (local-only): schedule while the page is open. The
  // session clock gates everything (nothing in the first hour) and the
  // evaluator enforces per-category daily caps and quiet hours.
  useEffect(() => {
    startReminderSession();
    const check = () => {
      void dispatchReminders().catch(() => {});
    };
    const onVisibility = () => {
      if (document.visibilityState === "visible") check();
    };
    const onEngagement = () => recordEngagement();
    check();
    const interval = window.setInterval(check, REMINDER_CHECK_INTERVAL_MS);
    document.addEventListener("visibilitychange", onVisibility);
    window.addEventListener("deepforge:progress-change", onEngagement);
    window.addEventListener("deepforge:daily-change", onEngagement);
    return () => {
      window.clearInterval(interval);
      document.removeEventListener("visibilitychange", onVisibility);
      window.removeEventListener("deepforge:progress-change", onEngagement);
      window.removeEventListener("deepforge:daily-change", onEngagement);
    };
  }, []);

  // Keep the bell affordance in sync with the opt-in flag.
  useEffect(() => {
    const refresh = () => setRemindersEnabled(getReminderPrefs().enabled);
    refresh();
    window.addEventListener(REMINDERS_CHANGE_EVENT, refresh);
    window.addEventListener("storage", refresh);
    return () => {
      window.removeEventListener(REMINDERS_CHANGE_EVENT, refresh);
      window.removeEventListener("storage", refresh);
    };
  }, []);

  // In-app fallback channel: emitted when a system notification can't be shown.
  useEffect(() => {
    const onReminder = (event: Event) => {
      const detail = (event as CustomEvent<Reminder>).detail;
      if (detail && typeof detail.title === "string") setInAppReminder(detail);
    };
    window.addEventListener(REMINDER_EVENT, onReminder);
    return () => window.removeEventListener(REMINDER_EVENT, onReminder);
  }, []);

  const handleInstall = async () => {
    if (!installEvent) return;
    try {
      await installEvent.prompt();
      await installEvent.userChoice;
    } catch {
      // The prompt can only be consumed once; failures are non-fatal.
    } finally {
      setInstallEvent(null);
    }
  };

  const handleUpdate = () => {
    const waiting = waitingWorkerRef.current;
    if (!waiting) return;
    applyRequestedRef.current = true;
    waiting.postMessage({ type: "SKIP_WAITING" });
    setUpdateReady(false);
  };

  const dismissUpdate = () => {
    // Dismisses for this page session; the next full load prompts again while
    // the update is still waiting.
    setUpdateReady(false);
  };

  const dismissIosHint = () => {
    try {
      window.localStorage.setItem(IOS_HINT_KEY, "1");
    } catch {
      // Storage unavailable — the hint simply won't be remembered.
    }
    window.dispatchEvent(new Event(IOS_HINT_EVENT));
  };

  const openReminder = () => {
    if (!inAppReminder) return;
    router.push(inAppReminder.href);
    setInAppReminder(null);
  };

  const snoozeReminder = () => {
    snoozeReminders();
    setInAppReminder(null);
  };

  const showInstallButton = installEvent !== null && !installDismissed && !installed;
  const showOfflineChip = !online;

  return (
    <div className="pointer-events-none fixed bottom-4 left-4 z-[60] flex max-w-[calc(100vw-2rem)] flex-col items-start gap-2">
      {inAppReminder && (
        <div
          role="status"
          aria-live="polite"
          className="pointer-events-auto max-w-xs rounded-md border border-hairline bg-canvas-card px-3 py-2.5 text-xs text-ink shadow-xl"
        >
          <p className="font-medium">{inAppReminder.title}</p>
          <p className="mt-1 text-body-mid">{inAppReminder.body}</p>
          <div className="mt-2 flex items-center gap-2">
            <button
              type="button"
              onClick={openReminder}
              className="rounded-md bg-accent px-2.5 py-1 font-medium text-canvas transition-opacity hover:opacity-90 focus:outline-none focus-visible:ring-1 focus-visible:ring-accent/40"
            >
              Open
            </button>
            <button
              type="button"
              onClick={snoozeReminder}
              className="rounded-md border border-hairline px-2.5 py-1 text-body-mid transition-colors hover:bg-canvas-soft hover:text-ink focus:outline-none focus-visible:ring-1 focus-visible:ring-accent/40"
            >
              Snooze 24h
            </button>
            <button
              type="button"
              onClick={() => setInAppReminder(null)}
              aria-label="Dismiss reminder"
              className="rounded-md border border-hairline px-2.5 py-1 text-body-mid transition-colors hover:bg-canvas-soft hover:text-ink focus:outline-none focus-visible:ring-1 focus-visible:ring-accent/40"
            >
              ✕
            </button>
          </div>
        </div>
      )}

      {updateReady && (
        <div
          role="status"
          aria-live="polite"
          className="pointer-events-auto max-w-xs rounded-md border border-hairline bg-canvas-card px-3 py-2.5 text-xs text-ink shadow-xl"
        >
          <p className="font-medium">Update available</p>
          <p className="mt-1 text-body-mid">
            A new version of DeepForge is ready. Reload to apply it.
          </p>
          <div className="mt-2 flex items-center gap-2">
            <button
              type="button"
              onClick={handleUpdate}
              aria-label="Update DeepForge and reload"
              className="rounded-md bg-accent px-2.5 py-1 font-medium text-canvas transition-colors hover:opacity-90 focus:outline-none focus-visible:ring-1 focus-visible:ring-accent/40"
            >
              Reload
            </button>
            <button
              type="button"
              onClick={dismissUpdate}
              aria-label="Dismiss update notification"
              className="rounded-md border border-hairline px-2.5 py-1 text-body-mid transition-colors hover:bg-canvas-soft hover:text-ink focus:outline-none focus-visible:ring-1 focus-visible:ring-accent/40"
            >
              Later
            </button>
          </div>
        </div>
      )}

      {shouldShowIosHint && (
        <div className="pointer-events-auto max-w-xs rounded-md border border-hairline bg-canvas-card px-3 py-2.5 text-xs text-ink shadow-xl">
          <p className="font-medium">Add to Home Screen</p>
          <p className="mt-1 text-body-mid">
            Tap Share, then{" "}
            <span className="text-ink">Add to Home Screen</span> to install
            DeepForge.
          </p>
          <button
            type="button"
            onClick={dismissIosHint}
            className="mt-2 rounded-md border border-hairline px-2 py-1 text-[11px] text-body-mid transition-colors hover:bg-canvas-soft hover:text-ink focus:outline-none focus-visible:ring-1 focus-visible:ring-accent/40"
          >
            Got it
          </button>
        </div>
      )}

      {showOfflineChip && (
        <div
          role="status"
          className="pointer-events-auto flex items-center gap-2 rounded-md border border-hairline bg-canvas-card px-2.5 py-1.5 text-xs text-ink shadow-lg"
        >
          <span
            className="h-1.5 w-1.5 shrink-0 rounded-full bg-warning"
            aria-hidden
          />
          <span>Offline — core features cached</span>
        </div>
      )}

      {showInstallButton && (
        <div className="pointer-events-auto flex items-stretch overflow-hidden rounded-md border border-hairline bg-canvas-card shadow-lg">
          <button
            type="button"
            onClick={handleInstall}
            aria-label="Install DeepForge app"
            className="flex items-center gap-2 px-3 py-2 text-xs font-medium text-ink transition-colors hover:bg-canvas-soft focus:outline-none focus-visible:ring-1 focus-visible:ring-accent/40"
          >
            <svg
              width="14"
              height="14"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="text-accent"
              aria-hidden
            >
              <path d="M12 3v12" />
              <path d="m7 10 5 5 5-5" />
              <path d="M5 21h14" />
            </svg>
            Install app
          </button>
          <button
            type="button"
            onClick={() => setInstallDismissed(true)}
            aria-label="Dismiss install prompt"
            className="flex items-center border-l border-hairline px-2.5 text-xs text-body-mid transition-colors hover:bg-canvas-soft hover:text-ink focus:outline-none focus-visible:ring-1 focus-visible:ring-accent/40"
          >
            ✕
          </button>
        </div>
      )}

      {settingsOpen && (
        <ReminderSettings onClose={() => setSettingsOpen(false)} />
      )}

      <button
        type="button"
        onClick={() => setSettingsOpen((open) => !open)}
        aria-label={settingsOpen ? "Close reminder settings" : "Open reminder settings"}
        aria-expanded={settingsOpen}
        className="pointer-events-auto relative flex h-8 w-8 items-center justify-center rounded-md border border-hairline bg-canvas-card text-body-mid shadow-lg transition-colors hover:bg-canvas-soft hover:text-ink focus:outline-none focus-visible:ring-1 focus-visible:ring-accent/40"
      >
        <BellGlyph />
        {remindersEnabled && (
          <span
            className="absolute -right-0.5 -top-0.5 h-2 w-2 rounded-full bg-accent"
            aria-hidden
          />
        )}
      </button>
    </div>
  );
}
