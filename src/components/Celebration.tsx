"use client";

import { useEffect, useRef, useState } from "react";

const DURATION = 1500;
const COUNT = 110;
const GRAVITY = 0.16;
const DRAG = 0.988;
const FALLBACK = ["#7FFF9F", "#FFB347", "#A0C3EC"];

interface Particle {
  x: number; y: number; vx: number; vy: number; size: number;
  rot: number; vrot: number; color: string; round: boolean; delay: number;
}

interface CelebrationProps {
  origin?: { x: number; y: number };
  onDone?: () => void;
}

function palette() {
  const css = getComputedStyle(document.documentElement);
  const colors = ["--accent", "--success", "--warning", "--info"]
    .map((key) => css.getPropertyValue(key).trim())
    .filter(Boolean);
  return colors.length > 0 ? colors : FALLBACK;
}

export function Celebration({ origin, onDone }: CelebrationProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const doneRef = useRef(onDone);
  const [phase, setPhase] = useState<"run" | "gone">(() =>
    typeof window !== "undefined" &&
    typeof window.matchMedia === "function" &&
    window.matchMedia("(prefers-reduced-motion: reduce)").matches
      ? "gone"
      : "run",
  );

  useEffect(() => {
    doneRef.current = onDone;
    if (phase === "gone") doneRef.current?.();
  }, [onDone, phase]);

  useEffect(() => {
    if (phase !== "run") return;
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext("2d");
    if (!canvas || !ctx) {
      const id = window.requestAnimationFrame(() => setPhase("gone"));
      return () => window.cancelAnimationFrame(id);
    }

    const width = window.innerWidth;
    const height = window.innerHeight;
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    canvas.width = Math.round(width * dpr);
    canvas.height = Math.round(height * dpr);
    ctx.scale(dpr, dpr);
    const colors = palette();
    const ox = origin?.x ?? width / 2;
    const oy = origin?.y ?? height * 0.22;
    const particles: Particle[] = Array.from({ length: COUNT }, (_, i) => {
      const angle = -Math.PI / 2 + (Math.random() - 0.5) * 1.9;
      const speed = 5.5 + Math.random() * 7;
      return {
        x: ox + (Math.random() - 0.5) * 44,
        y: oy + (Math.random() - 0.5) * 10,
        vx: Math.cos(angle) * speed + (Math.random() - 0.5) * 1.6,
        vy: Math.sin(angle) * speed,
        size: 3 + Math.random() * 5,
        rot: Math.random() * Math.PI,
        vrot: (Math.random() - 0.5) * 0.32,
        color: colors[i % colors.length],
        round: Math.random() < 0.35,
        delay: Math.random() * 160,
      };
    });

    const motion = window.matchMedia("(prefers-reduced-motion: reduce)");
    let frame = 0;
    let cancelled = false;
    let last = performance.now();
    const start = last;
    const finish = () => {
      if (cancelled) return;
      cancelled = true;
      window.cancelAnimationFrame(frame);
      ctx.clearRect(0, 0, width, height);
      setPhase("gone");
    };
    const onMotionChange = () => {
      if (motion.matches) finish();
    };
    motion.addEventListener("change", onMotionChange);

    const step = (now: number) => {
      if (cancelled) return;
      const elapsed = now - start;
      const dt = Math.min(3, (now - last) / 16.667);
      last = now;
      ctx.clearRect(0, 0, width, height);
      const fade = Math.max(0, 1 - Math.max(0, elapsed - DURATION / 2) / (DURATION / 2));
      for (const p of particles) {
        if (elapsed < p.delay) continue;
        p.vy += GRAVITY * dt;
        p.vx *= Math.pow(DRAG, dt);
        p.x += p.vx * dt;
        p.y += p.vy * dt;
        p.rot += p.vrot * dt;
        ctx.globalAlpha = fade;
        ctx.fillStyle = p.color;
        if (p.round) {
          ctx.beginPath();
          ctx.arc(p.x, p.y, p.size * 0.45, 0, Math.PI * 2);
          ctx.fill();
        } else {
          ctx.save();
          ctx.translate(p.x, p.y);
          ctx.rotate(p.rot);
          ctx.fillRect(-p.size / 2, -p.size * 0.35, p.size, p.size * 0.7);
          ctx.restore();
        }
      }
      ctx.globalAlpha = 1;
      if (elapsed < DURATION) frame = window.requestAnimationFrame(step);
      else finish();
    };
    frame = window.requestAnimationFrame(step);

    return () => {
      cancelled = true;
      motion.removeEventListener("change", onMotionChange);
      window.cancelAnimationFrame(frame);
      ctx.clearRect(0, 0, width, height);
    };
  }, [phase, origin]);

  if (phase !== "run") return null;
  return (
    <canvas
      ref={canvasRef}
      aria-hidden
      className="pointer-events-none fixed inset-0 z-40 h-full w-full"
    />
  );
}
