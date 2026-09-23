"use client";

import { useEffect, useRef } from "react";
import { prefersReducedMotion } from "@/lib/gsap";

/** Infinite marquee that speeds up — and reverses — with scroll velocity. */
export default function Marquee({
  children,
  speed = 60,
  className = "",
  reverse = false,
}: {
  children: React.ReactNode;
  speed?: number;
  className?: string;
  reverse?: boolean;
}) {
  const track = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = track.current;
    if (!el || prefersReducedMotion()) return;
    let x = 0;
    let boost = 0;
    let dir = reverse ? 1 : -1;
    let lastY = scrollY;
    let last = performance.now();
    let raf = 0;
    const onScroll = () => {
      const dy = scrollY - lastY;
      lastY = scrollY;
      boost = Math.min(Math.abs(dy) * 0.6, 40);
      if (Math.abs(dy) > 2) dir = (dy > 0 ? -1 : 1) * (reverse ? -1 : 1);
    };
    const loop = (now: number) => {
      const dt = Math.min((now - last) / 1000, 0.05);
      last = now;
      const half = el.scrollWidth / 2;
      x += dir * (speed + boost * speed * 0.15) * dt;
      if (x <= -half) x += half;
      if (x > 0) x -= half;
      el.style.transform = `translate3d(${x}px,0,0)`;
      boost *= 0.92;
      raf = requestAnimationFrame(loop);
    };
    addEventListener("scroll", onScroll, { passive: true });
    raf = requestAnimationFrame(loop);
    return () => {
      removeEventListener("scroll", onScroll);
      cancelAnimationFrame(raf);
    };
  }, [speed, reverse]);

  return (
    <div className={`marquee ${className}`} aria-hidden>
      <div ref={track} className="marquee-track">
        <div className="flex shrink-0 items-center">{children}</div>
        <div className="flex shrink-0 items-center">{children}</div>
      </div>
    </div>
  );
}
