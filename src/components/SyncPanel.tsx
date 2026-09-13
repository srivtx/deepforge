"use client";

import { useCallback, useEffect, useRef, useState, useSyncExternalStore } from "react";
import {
  getAuthEmail,
  isGoogleEnabled,
  onAuthChange,
  signInWithEmail,
  signInWithGoogle,
  signOut,
} from "@/lib/auth";
import { isSupabaseConfigured } from "@/lib/sync/backend";
import { loadRemoteSync } from "@/lib/sync/remoteLazy";
import { cn } from "@/lib/utils";

type SyncStatus = "unconfigured" | "signed-out" | "idle" | "syncing" | "error";

interface SyncSnapshot {
  status: SyncStatus;
  email: string | null;
  lastSyncedAt: string | null;
  error: string | null;
}

interface SyncPanelProps {
  open: boolean;
  onClose: () => void;
}

const EMPTY_SNAPSHOT: SyncSnapshot = {
  status: "unconfigured",
  email: null,
  lastSyncedAt: null,
  error: null,
};

const FIELD_CLASSES =
  "w-full rounded-lg border border-hairline bg-canvas px-3 py-2 text-sm text-ink placeholder:text-mute focus:border-accent/50 focus:outline-none focus:ring-1 focus:ring-accent/30";

const PRIMARY_BUTTON_CLASSES =
  "inline-flex items-center justify-center gap-1.5 rounded-lg bg-accent px-3.5 py-1.5 text-xs font-medium text-canvas transition-opacity hover:opacity-90 disabled:cursor-default disabled:opacity-40 focus:outline-none focus-visible:ring-1 focus-visible:ring-accent/40";

const SECONDARY_BUTTON_CLASSES =
  "inline-flex items-center justify-center rounded-lg border border-hairline px-3 py-1.5 text-xs text-body-mid transition-colors hover:bg-canvas-soft hover:text-ink disabled:cursor-default disabled:opacity-40 focus:outline-none focus-visible:ring-1 focus-visible:ring-accent/40";

const DANGER_BUTTON_CLASSES =
  "inline-flex items-center justify-center rounded-lg border border-error/30 px-3 py-1.5 text-xs text-error transition-colors hover:bg-error/10 disabled:cursor-default disabled:opacity-40 focus:outline-none focus-visible:ring-1 focus-visible:ring-error/40";

const DANGER_CONFIRM_BUTTON_CLASSES =
  "inline-flex items-center justify-center rounded-lg border border-error/60 bg-error/10 px-3 py-1.5 text-xs font-medium text-error transition-colors hover:bg-error/20 disabled:cursor-default disabled:opacity-40 focus:outline-none focus-visible:ring-1 focus-visible:ring-error/40";

function formatRelativeTime(iso: string): string {
  const then = new Date(iso).getTime();
  if (Number.isNaN(then)) return "recently";
  const diff = Date.now() - then;
  if (diff < 45_000) return "just now";
  const minutes = Math.round(diff / 60_000);
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.round(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.round(hours / 24);
  return `${days}d ago`;
}

function clearAuthParamsFromUrl(): void {
  try {
    const url = new URL(window.location.href);
    url.hash = "";
    url.searchParams.delete("code");
    window.history.replaceState(
      null,
      "",
      `${url.pathname}${url.search}${url.hash}`,
    );
  } catch {
    window.history.replaceState(null, "", window.location.pathname);
  }
}

function hasAuthParamsInUrl(): boolean {
  if (typeof window === "undefined") return false;
  return (
    window.location.hash.includes("access_token") ||
    window.location.search.includes("code")
  );
}

function GoogleMark() {
  return (
    <svg
      className="h-3.5 w-3.5 shrink-0"
      viewBox="0 0 24 24"
      fill="none"
      aria-hidden
    >
      <path
        fill="currentColor"
        d="M12.48 10.92v3.28h7.84c-.24 1.84-.853 3.187-1.787 4.133-1.147 1.147-2.933 2.4-6.053 2.4-4.827 0-8.6-3.893-8.6-8.72s3.773-8.72 8.6-8.72c2.6 0 4.507 1.027 5.907 2.347l2.307-2.307C18.747 1.44 16.133 0 12.48 0 5.867 0 .307 5.387.307 12s5.56 12 12.173 12c3.573 0 6.267-1.173 8.373-3.36 2.16-2.16 2.84-5.213 2.84-7.667 0-.76-.053-1.467-.173-2.053H12.48z"
      />
    </svg>
  );
}

function Spinner() {
  return (
    <svg
      className="df-spin h-3.5 w-3.5 shrink-0"
      viewBox="0 0 24 24"
      fill="none"
      aria-hidden
    >
      <circle
        cx="12"
        cy="12"
        r="9"
        stroke="currentColor"
        strokeWidth="2.5"
        opacity="0.25"
      />
      <path
        d="M21 12a9 9 0 0 0-9-9"
        stroke="currentColor"
        strokeWidth="2.5"
        strokeLinecap="round"
      />
    </svg>
  );
}

export function SyncPanel({ open, onClose }: SyncPanelProps) {
  const mounted = useSyncExternalStore(
    () => () => {},
    () => true,
    () => false,
  );
  const [snapshot, setSnapshot] = useState<SyncSnapshot>(EMPTY_SNAPSHOT);
  const [email, setEmail] = useState<string | null>(() =>
    typeof window === "undefined" ? null : getAuthEmail(),
  );
  const [magicLinkDone, setMagicLinkDone] = useState(false);
  const [completingDismissed, setCompletingDismissed] = useState(false);
  const [loginEmail, setLoginEmail] = useState("");
  const [pending, setPending] = useState(false);
  const [sentTo, setSentTo] = useState<string | null>(null);
  const [formError, setFormError] = useState<string | null>(null);
  const [googlePending, setGooglePending] = useState(false);
  const [googleError, setGoogleError] = useState<string | null>(null);
  const [confirmSignOut, setConfirmSignOut] = useState(false);
  const [signingOut, setSigningOut] = useState(false);

  const dialogRef = useRef<HTMLDivElement>(null);
  const previouslyFocused = useRef<HTMLElement | null>(null);

  const completing =
    mounted && !magicLinkDone && email === null && hasAuthParamsInUrl();
  const visible = open || (completing && !completingDismissed);
  const close = useCallback(() => {
    setCompletingDismissed(true);
    setConfirmSignOut(false);
    onClose();
  }, [onClose]);

  useEffect(() => {
    if (!visible) return;
    let active = true;
    let unsubscribe: (() => void) | null = null;
    void loadRemoteSync()
      .then((remote) => {
        if (!active) return;
        setSnapshot(remote.getSyncState());
        unsubscribe = remote.onSyncStateChange(() =>
          setSnapshot(remote.getSyncState()),
        );
      })
      .catch(() => {
        /* engine reports its own failures through sync state */
      });
    return () => {
      active = false;
      unsubscribe?.();
    };
  }, [visible]);

  useEffect(() => {
    if (!visible) return;
    const unsubscribe = onAuthChange((next) => setEmail(next));
    return unsubscribe;
  }, [visible]);

  useEffect(() => {
    if (!hasAuthParamsInUrl()) return;
    const startedAt = Date.now();
    const timer = window.setInterval(() => {
      if (getAuthEmail() !== null || Date.now() - startedAt >= 5000) {
        window.clearInterval(timer);
        clearAuthParamsFromUrl();
        setMagicLinkDone(true);
      }
    }, 400);
    return () => window.clearInterval(timer);
  }, []);

  useEffect(() => {
    if (!visible) return;
    previouslyFocused.current =
      document.activeElement instanceof HTMLElement
        ? document.activeElement
        : null;
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    dialogRef.current?.focus();
    return () => {
      document.body.style.overflow = prevOverflow;
      const el = previouslyFocused.current;
      if (el && el.isConnected) el.focus();
    };
  }, [visible]);

  useEffect(() => {
    if (!visible) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") close();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [visible, close]);

  useEffect(() => {
    if (!confirmSignOut) return;
    const timer = window.setTimeout(() => setConfirmSignOut(false), 4000);
    return () => window.clearTimeout(timer);
  }, [confirmSignOut]);

  const trapTab = (e: React.KeyboardEvent<HTMLDivElement>) => {
    if (e.key !== "Tab") return;
    const root = dialogRef.current;
    if (!root) return;
    const focusable = Array.from(
      root.querySelectorAll<HTMLElement>(
        'a[href], button:not([disabled]), textarea:not([disabled]), input:not([disabled]), select:not([disabled]), [tabindex]:not([tabindex="-1"])',
      ),
    ).filter((el) => el.getClientRects().length > 0);
    if (focusable.length === 0) return;
    const first = focusable[0];
    const last = focusable[focusable.length - 1];
    const active = document.activeElement;
    if (e.shiftKey) {
      if (active === first || active === root || !root.contains(active)) {
        e.preventDefault();
        last.focus();
      }
    } else if (active === last || active === root || !root.contains(active)) {
      e.preventDefault();
      first.focus();
    }
  };

  const handleSendLink = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (pending) return;
    const address = loginEmail.trim();
    if (address.length === 0) {
      setFormError("Enter your email address.");
      return;
    }
    setPending(true);
    setFormError(null);
    try {
      const { error } = await signInWithEmail(address);
      if (error) {
        setFormError(error);
      } else {
        setSentTo(address);
        setLoginEmail("");
      }
    } catch {
      setFormError(
        "Could not send the link. Check your connection and try again.",
      );
    } finally {
      setPending(false);
    }
  };

  const handleGoogleSignIn = async () => {
    if (pending || googlePending) return;
    setGooglePending(true);
    setGoogleError(null);
    setFormError(null);
    try {
      const { error } = await signInWithGoogle();
      if (error) {
        setGoogleError(error);
        setGooglePending(false);
      }
    } catch {
      setGoogleError(
        "Could not start Google sign-in. Check your connection and try again.",
      );
      setGooglePending(false);
    }
  };

  const handleSyncNow = () => {
    void loadRemoteSync()
      .then((remote) => remote.syncNow())
      .catch(() => {});
  };

  const handleSignOut = async () => {
    if (!confirmSignOut) {
      setConfirmSignOut(true);
      return;
    }
    setConfirmSignOut(false);
    setSigningOut(true);
    try {
      await signOut();
    } catch {
      /* auth state resolves through onAuthChange */
    } finally {
      setSigningOut(false);
    }
  };

  if (!visible) return null;

  const configured = isSupabaseConfigured();
  const accountEmail = email ?? snapshot.email;
  const syncing = snapshot.status === "syncing";
  const statusIsError = snapshot.status === "error" && snapshot.error !== null;

  return (
    <div
      className="df-fade-in fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-canvas/60 px-3 pb-8 pt-[10vh] backdrop-blur-sm"
      role="presentation"
      onMouseDown={(e) => {
        if (e.target === e.currentTarget) close();
      }}
      onClick={(e) => {
        if (e.target === e.currentTarget) close();
      }}
    >
      <div
        ref={dialogRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby="sync-panel-title"
        tabIndex={-1}
        onKeyDown={trapTab}
        className="df-slide-up w-full max-w-md overflow-hidden rounded-lg border border-hairline bg-canvas-card text-left focus:outline-none"
      >
        <div className="flex items-center justify-between border-b border-hairline px-4 py-3">
          <h2
            id="sync-panel-title"
            className="text-sm font-semibold tracking-tight text-ink"
          >
            Sync across devices
          </h2>
          <button
            type="button"
            onClick={close}
            aria-label="Close sync dialog"
            className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md text-mute transition-colors hover:bg-canvas-soft hover:text-ink focus:outline-none focus-visible:ring-1 focus-visible:ring-accent/40"
          >
            <svg
              width="14"
              height="14"
              viewBox="0 0 16 16"
              fill="none"
              aria-hidden
            >
              <path
                d="M3 3l10 10M13 3L3 13"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
              />
            </svg>
          </button>
        </div>

        <div className="px-4 py-4 sm:px-5">
          {completing ? (
            <div className="flex items-center gap-3 py-2">
              <Spinner />
              <div>
                <p className="text-sm text-ink">Completing sign-in…</p>
                <p className="mt-0.5 text-xs text-body-mid">
                  Finishing the sign-in handshake with your account.
                </p>
              </div>
            </div>
          ) : !configured ? (
            <div>
              <p className="text-sm text-body">
                This build has no Supabase environment configured, so
                everything stays local to this browser.
              </p>
              <p className="mt-2 text-xs text-body-mid">
                Progress, streaks, collections, labs, and research are saved on
                this device only. To enable cross-device sync, set{" "}
                <code className="font-mono text-[11px] text-ink">
                  NEXT_PUBLIC_SUPABASE_URL
                </code>{" "}
                and{" "}
                <code className="font-mono text-[11px] text-ink">
                  NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY
                </code>{" "}
                and redeploy.
              </p>
            </div>
          ) : accountEmail === null ? (
            <div>
              <p className="text-sm text-body">
                Sign in to sync your progress, streaks, collections, labs, and
                research across devices.
              </p>
              <p className="mt-2 text-xs text-body-mid">
                Your local data stays on this device and is merged into your
                account — nothing is wiped, and no account is needed to keep
                using the app.
              </p>

              {sentTo !== null ? (
                <div className="mt-4 rounded-lg border border-hairline bg-canvas px-3 py-3">
                  <p role="status" className="text-sm text-ink">
                    Check your inbox — link sent to{" "}
                    <span className="font-medium">{sentTo}</span>
                  </p>
                  <p className="mt-1.5 text-xs text-body-mid">
                    Open the link and you&apos;ll be signed in here
                    automatically. If it doesn&apos;t arrive, request a new one.
                  </p>
                  <button
                    type="button"
                    onClick={() => {
                      setSentTo(null);
                      setFormError(null);
                    }}
                    className={cn(SECONDARY_BUTTON_CLASSES, "mt-3")}
                  >
                    Use a different email
                  </button>
                </div>
              ) : (
                <div className="mt-4">
                  {isGoogleEnabled() && (
                    <>
                      <button
                        type="button"
                        onClick={handleGoogleSignIn}
                        disabled={pending || googlePending}
                        aria-busy={googlePending}
                        className={cn(PRIMARY_BUTTON_CLASSES, "w-full py-2")}
                      >
                        {googlePending ? (
                          <>
                            <Spinner />
                            Connecting…
                          </>
                        ) : (
                          <>
                            <GoogleMark />
                            Continue with Google
                          </>
                        )}
                      </button>
                      {googleError !== null && (
                        <p role="alert" className="mt-2 text-xs text-error">
                          {googleError}
                        </p>
                      )}
                      <div className="my-4 flex items-center gap-3" aria-hidden>
                        <span className="h-px flex-1 bg-hairline" />
                        <span className="text-xs text-mute">or</span>
                        <span className="h-px flex-1 bg-hairline" />
                      </div>
                    </>
                  )}
                  <form onSubmit={handleSendLink} noValidate>
                    <label
                      htmlFor="sync-email"
                      className="block text-xs font-medium text-body-mid"
                    >
                      Email
                    </label>
                    <input
                      id="sync-email"
                      type="email"
                      inputMode="email"
                      autoComplete="email"
                      spellCheck={false}
                      value={loginEmail}
                      onChange={(e) => {
                        setLoginEmail(e.target.value);
                        if (formError !== null) setFormError(null);
                      }}
                      placeholder="you@example.com"
                      disabled={pending || googlePending}
                      className={cn(
                        FIELD_CLASSES,
                        "mt-1.5 disabled:cursor-default disabled:opacity-60",
                      )}
                    />
                    {formError !== null && (
                      <p role="alert" className="mt-2 text-xs text-error">
                        {formError}
                      </p>
                    )}
                    <button
                      type="submit"
                      disabled={
                        pending ||
                        googlePending ||
                        loginEmail.trim().length === 0
                      }
                      className={cn(PRIMARY_BUTTON_CLASSES, "mt-3 w-full py-2")}
                    >
                      {pending ? (
                        <>
                          <Spinner />
                          Sending…
                        </>
                      ) : (
                        "Send magic link"
                      )}
                    </button>
                    <p className="mt-2 text-xs text-mute">
                      We&apos;ll email you a one-time link. Open it on any
                      device to finish signing in.
                    </p>
                  </form>
                </div>
              )}
            </div>
          ) : (
            <div>
              <div className="flex min-w-0 items-center gap-2">
                <span
                  className="h-1.5 w-1.5 shrink-0 rounded-full bg-accent"
                  aria-hidden
                />
                <p className="min-w-0 truncate text-sm text-ink">
                  {accountEmail}
                </p>
              </div>
              <p
                aria-live="polite"
                className={cn(
                  "mt-2 flex items-center gap-1.5 text-xs",
                  statusIsError ? "text-error" : "text-body-mid",
                )}
              >
                {syncing && <Spinner />}
                {statusIsError
                  ? `Error: ${snapshot.error}`
                  : syncing
                    ? "Syncing…"
                    : snapshot.lastSyncedAt !== null
                      ? `Last synced ${formatRelativeTime(snapshot.lastSyncedAt)}`
                      : "Idle"}
              </p>
              <div className="mt-4 flex flex-wrap items-center gap-2">
                <button
                  type="button"
                  onClick={handleSyncNow}
                  disabled={syncing}
                  className={PRIMARY_BUTTON_CLASSES}
                >
                  {syncing ? (
                    <>
                      <Spinner />
                      Syncing…
                    </>
                  ) : (
                    "Sync now"
                  )}
                </button>
                <button
                  type="button"
                  onClick={handleSignOut}
                  disabled={signingOut}
                  aria-label={
                    confirmSignOut ? "Confirm sign out" : "Sign out"
                  }
                  className={
                    confirmSignOut
                      ? DANGER_CONFIRM_BUTTON_CLASSES
                      : DANGER_BUTTON_CLASSES
                  }
                >
                  {confirmSignOut
                    ? "Confirm sign out"
                    : signingOut
                      ? "Signing out…"
                      : "Sign out"}
                </button>
              </div>
              <p className="mt-3 text-xs text-body-mid">
                Signing out keeps all local data on this device. Sync resumes
                the next time you sign in.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
