"use client";

import { useEffect, useRef, useState } from "react";

interface AuroraProps {
  className?: string;
}

/**
 * Ambient hero background: two token-tinted radial layers drifting on slow
 * transform-only loops. Paused while the tab is hidden or the hero is
 * off-screen; static under reduced motion (CSS). Purely decorative.
 */
export function Aurora({ className }: AuroraProps) {
  const ref = useRef<HTMLDivElement>(null);
  const [paused, setPaused] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    let onScreen = true;
    let tabVisible = document.visibilityState !== "hidden";

    const sync = () => setPaused(!onScreen || !tabVisible);

    const onVisibility = () => {
      tabVisible = document.visibilityState !== "hidden";
      sync();
    };

    let observer: IntersectionObserver | undefined;
    if (typeof IntersectionObserver !== "undefined") {
      observer = new IntersectionObserver(
        (entries) => {
          onScreen = entries.some((entry) => entry.isIntersecting);
          sync();
        },
        { threshold: 0 },
      );
      observer.observe(el);
    }

    document.addEventListener("visibilitychange", onVisibility);
    sync();

    return () => {
      observer?.disconnect();
      document.removeEventListener("visibilitychange", onVisibility);
    };
  }, []);

  return (
    <div
      ref={ref}
      aria-hidden
      data-paused={paused ? "true" : undefined}
      className={`df-aurora absolute inset-0 -z-10${
        className ? ` ${className}` : ""
      }`}
    >
      <div className="df-aurora-layer df-aurora-a" />
      <div className="df-aurora-layer df-aurora-b" />
    </div>
  );
}
