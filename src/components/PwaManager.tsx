"use client";

import { useEffect, useState, useSyncExternalStore } from "react";

/**
 * Client-side PWA glue: registers the service worker, surfaces the browser
 * install prompt, shows an offline status chip, and nudges iOS Safari users
 * toward Add to Home Screen. Mounted once near the root of the app.
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

export function PwaManager() {
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

  useEffect(() => {
    if (process.env.NODE_ENV !== "production") return;
    if (typeof navigator === "undefined" || !("serviceWorker" in navigator)) {
      return;
    }
    navigator.serviceWorker.register("/sw.js", { scope: "/" }).catch(() => {
      // Best-effort: the app works fine without an active service worker.
    });
  }, []);

  // Dev / localhost self-heal: remove any service worker and cached build
  // output left behind by earlier runs (for example a production build served
  // on localhost). A stale worker serves immutable-looking chunk URLs
  // cache-first, which shows up as stale CSS after state changes until a hard
  // refresh. Registrations are empty in a clean browser, so this is a no-op.
  useEffect(() => {
    const host = window.location.hostname;
    const isLocal =
      host === "localhost" || host === "127.0.0.1" || host === "0.0.0.0";
    if (process.env.NODE_ENV === "production" && !isLocal) return;
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

  const dismissIosHint = () => {
    try {
      window.localStorage.setItem(IOS_HINT_KEY, "1");
    } catch {
      // Storage unavailable — the hint simply won't be remembered.
    }
    window.dispatchEvent(new Event(IOS_HINT_EVENT));
  };

  const showInstallButton = installEvent !== null && !installDismissed && !installed;
  const showOfflineChip = !online;

  if (!showInstallButton && !showOfflineChip && !shouldShowIosHint) {
    return null;
  }

  return (
    <div className="pointer-events-none fixed bottom-4 left-4 z-[60] flex max-w-[calc(100vw-2rem)] flex-col items-start gap-2">
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
            className="mt-2 rounded-md border border-hairline px-2 py-1 text-[11px] text-body-mid transition-colors hover:bg-canvas-soft hover:text-ink"
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
            className="flex items-center gap-2 px-3 py-2 text-xs font-medium text-ink transition-colors hover:bg-canvas-soft"
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
            className="flex items-center border-l border-hairline px-2.5 text-xs text-body-mid transition-colors hover:bg-canvas-soft hover:text-ink"
          >
            ✕
          </button>
        </div>
      )}
    </div>
  );
}
