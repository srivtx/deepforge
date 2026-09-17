"use client";

import {
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
  type ReactNode,
} from "react";
import { prefersReducedMotion, useReducedMotion } from "./useReducedMotion";

const useIsomorphicLayoutEffect =
  typeof window !== "undefined" ? useLayoutEffect : useEffect;

interface RevealProps {
  children: ReactNode;
  className?: string;
  /** Stagger delay in milliseconds before the reveal runs. */
  delay?: number;
}

/**
 * IntersectionObserver fade + 12px rise, once per element. Content renders
 * visible on the server and for no-JS/reduced-motion users; the hidden state
 * is only applied after mount, and only when the element will actually be
 * animated, so content can never be stranded hidden.
 */
export function Reveal({ children, className, delay = 0 }: RevealProps) {
  const ref = useRef<HTMLDivElement>(null);
  const [hidden, setHidden] = useState(false);
  const delayRef = useRef(delay);
  const reduced = useReducedMotion();

  useEffect(() => {
    delayRef.current = delay;
  }, [delay]);

  useIsomorphicLayoutEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (typeof IntersectionObserver === "undefined") return;
    if (prefersReducedMotion()) return;

    let timer = 0;
    setHidden(true);

    const observer = new IntersectionObserver(
      (entries) => {
        if (!entries.some((entry) => entry.isIntersecting)) return;
        observer.disconnect();
        timer = window.setTimeout(() => setHidden(false), delayRef.current);
      },
      { threshold: 0.1, rootMargin: "0px 0px -32px 0px" },
    );
    observer.observe(el);

    return () => {
      observer.disconnect();
      window.clearTimeout(timer);
    };
  }, []);

  const classes = `df-reveal${hidden && !reduced ? " df-reveal-hidden" : ""}${
    className ? ` ${className}` : ""
  }`;

  return (
    <div ref={ref} className={classes}>
      {children}
    </div>
  );
}
