"use client";

import { useEffect, useRef } from "react";
import { prefersReducedMotion, useReducedMotion } from "./useReducedMotion";

interface CountUpProps {
  /** Final value. Rendered server-side, so hydration and no-JS match. */
  value: number;
  /** Animation length in milliseconds. */
  duration?: number;
  className?: string;
}

const formatter = new Intl.NumberFormat("en-US");

/**
 * Counts a number up once when it scrolls into view. The server renders the
 * final value and the animation only replaces it after mount when motion is
 * allowed (reduced motion leaves the final value untouched). The formatted
 * final text is used to reserve width in `ch`, so nothing shifts while the
 * digits grow.
 */
export function CountUp({ value, duration = 800, className }: CountUpProps) {
  const ref = useRef<HTMLSpanElement>(null);
  const runningRef = useRef(false);
  const valueRef = useRef(value);
  const reduced = useReducedMotion();
  const finalText = formatter.format(value);

  useEffect(() => {
    valueRef.current = value;
    const el = ref.current;
    if (el && !runningRef.current) el.textContent = formatter.format(value);
  }, [value]);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    if (reduced || prefersReducedMotion()) {
      runningRef.current = false;
      el.textContent = formatter.format(valueRef.current);
      return;
    }
    if (typeof IntersectionObserver === "undefined") return;

    let frame = 0;
    let cancelled = false;

    const animate = () => {
      runningRef.current = true;
      const target = valueRef.current;
      const startTime = performance.now();

      const step = (now: number) => {
        if (cancelled) return;
        const progress = Math.min(1, (now - startTime) / duration);
        const eased = 1 - Math.pow(1 - progress, 3);
        if (progress < 1) {
          el.textContent = formatter.format(Math.round(target * eased));
          frame = window.requestAnimationFrame(step);
        } else {
          runningRef.current = false;
          el.textContent = formatter.format(valueRef.current);
        }
      };
      frame = window.requestAnimationFrame(step);
    };

    const observer = new IntersectionObserver(
      (entries) => {
        if (!entries.some((entry) => entry.isIntersecting)) return;
        observer.disconnect();
        animate();
      },
      { threshold: 0.4 },
    );
    observer.observe(el);

    return () => {
      cancelled = true;
      runningRef.current = false;
      observer.disconnect();
      window.cancelAnimationFrame(frame);
    };
  }, [duration, reduced]);

  return (
    <span className={className}>
      <span
        ref={ref}
        style={{ display: "inline-block", minWidth: `${finalText.length}ch` }}
      >
        {finalText}
      </span>
    </span>
  );
}
