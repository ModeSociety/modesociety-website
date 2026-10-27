"use client";

import { useEffect, useRef, useState } from "react";
import { prefersReducedMotion } from "@/lib/gsap";
import { compact } from "@/lib/tech";

/**
 * A number that counts up when it scrolls into view. Numbers are shown compact
 * (1.2M); text values such as "In-house" or "40+" show as they are.
 */
export default function CountUp({ value, className = "" }: { value: number | string; className?: string }) {
  const ref = useRef<HTMLSpanElement>(null);
  const numeric = typeof value === "number";
  const final = numeric ? compact(value) : String(value);
  const [text, setText] = useState(final);

  useEffect(() => {
    const el = ref.current;
    if (!el || !numeric || prefersReducedMotion()) return;
    setText(compact(0));
    let raf = 0;
    const io = new IntersectionObserver(
      ([e]) => {
        if (!e.isIntersecting) return;
        io.disconnect();
        const t0 = performance.now();
        const step = (now: number) => {
          const k = Math.min(1, (now - t0) / 1400);
          setText(compact((value as number) * (1 - Math.pow(1 - k, 4))));
          if (k < 1) raf = requestAnimationFrame(step);
        };
        raf = requestAnimationFrame(step);
      },
      { threshold: 0.6 },
    );
    io.observe(el);
    return () => {
      io.disconnect();
      cancelAnimationFrame(raf);
    };
  }, [value, numeric]);

  return (
    <span ref={ref} className={`tabular-nums ${className}`}>
      <span className="sr-only">{final}</span>
      <span aria-hidden>{text}</span>
    </span>
  );
}
