"use client";

import { useEffect, useRef } from "react";
import { prefersReducedMotion } from "@/lib/gsap";

type MarkKind = "circle" | "underline" | "cross" | "strike" | "arrow";

/** Hand-drawn marker strokes (viewBox units); several strokes draw one after another. */
const STROKES: Record<MarkKind, { box: string; paths: string[] }> = {
  circle: {
    box: "0 0 200 80",
    paths: ["M22 46 C 18 16, 118 2, 178 20 C 206 30, 196 68, 116 75 C 54 80, 6 66, 12 40 C 16 22, 64 10, 112 9"],
  },
  underline: {
    box: "0 0 200 24",
    paths: ["M3 13 C 46 6, 102 4, 197 8", "M24 20 C 76 14, 128 14, 184 16"],
  },
  cross: {
    box: "0 0 100 100",
    paths: ["M12 10 C 38 36, 62 62, 90 92", "M88 8 C 62 34, 36 64, 10 90"],
  },
  strike: {
    box: "0 0 200 24",
    paths: ["M2 14 C 50 9, 120 15, 198 10"],
  },
  arrow: {
    box: "0 0 140 60",
    paths: ["M6 44 C 34 12, 86 6, 128 28", "M112 12 C 120 20, 126 25, 130 29 C 122 32, 114 36, 106 42"],
  },
};

/** Where each stroke sits relative to the words it marks. */
const PLACE: Record<MarkKind, string> = {
  // an <svg> is a replaced element, so it needs explicit sizes rather than left+right insets
  circle: "-left-[0.2em] -top-[0.12em] h-[calc(100%+0.24em)] w-[calc(100%+0.4em)]",
  underline: "left-0 -bottom-[0.24em] h-[0.34em] w-full",
  cross: "left-0 top-0 h-full w-full",
  strike: "-left-[4%] top-[40%] h-[0.3em] w-[108%]",
  arrow: "left-full top-1/2 ml-2 h-[0.9em] w-[2.1em] -translate-y-1/2",
};

/**
 * Red marker over a word or phrase, like the scribbled-on magazine pages in the moodboard.
 * Draws itself on when it scrolls into view.
 */
export function Mark({
  kind = "underline",
  children,
  className = "",
  delay = 0,
}: {
  kind?: MarkKind;
  children?: React.ReactNode;
  className?: string;
  delay?: number;
}) {
  const ref = useRef<SVGSVGElement>(null);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (prefersReducedMotion()) {
      el.classList.add("drawn");
      return;
    }
    const io = new IntersectionObserver(
      ([e]) => {
        if (!e.isIntersecting) return;
        setTimeout(() => el.classList.add("drawn"), delay * 1000);
        io.disconnect();
      },
      { threshold: 0.6 },
    );
    io.observe(el);
    return () => io.disconnect();
  }, [delay]);

  const s = STROKES[kind];
  return (
    <span className={`relative inline-block ${className}`}>
      {children}
      <svg
        ref={ref}
        viewBox={s.box}
        preserveAspectRatio="none"
        aria-hidden
        className={`mark-svg pointer-events-none absolute overflow-visible text-red ${PLACE[kind]}`}
      >
        {s.paths.map((d) => (
          <path
            key={d}
            d={d}
            pathLength={1}
            fill="none"
            stroke="currentColor"
            strokeWidth={kind === "circle" ? 2.5 : 3}
            strokeLinecap="round"
            strokeLinejoin="round"
            vectorEffect="non-scaling-stroke"
          />
        ))}
      </svg>
    </span>
  );
}

/**
 * The magazine-style rule that opens a section: "(01)  The agency ———— Melbourne → worldwide".
 */
export function SectionHead({
  index,
  label,
  meta,
  tone = "light",
  className = "",
}: {
  index?: string;
  label: string;
  meta?: React.ReactNode;
  tone?: "light" | "dark";
  className?: string;
}) {
  const dark = tone === "dark";
  return (
    <div
      className={`flex items-baseline justify-between gap-6 border-t pt-3 font-mono text-[11px] font-medium uppercase tracking-[0.04em] ${
        dark ? "border-white/30 text-white/75" : "border-espresso/15 text-muted"
      } ${className}`}
    >
      <span className="flex shrink-0 gap-3 whitespace-nowrap md:gap-4">
        {index && <span className={dark ? "text-white" : "text-ink"}>({index})</span>}
        <span>{label}</span>
      </span>
      {meta && <span className="min-w-0 text-right">{meta}</span>}
    </div>
  );
}

/**
 * Sets its text on one line exactly as wide as its container, like a cover masthead.
 * Re-fits on resize and once the web font has loaded.
 */
export function FitText({ children, className = "", max = 2000 }: { children: React.ReactNode; className?: string; max?: number }) {
  const ref = useRef<HTMLSpanElement>(null);
  useEffect(() => {
    const el = ref.current;
    const box = el?.parentElement;
    if (!el || !box) return;
    const fit = () => {
      el.style.fontSize = "100px";
      const w = el.scrollWidth;
      const cs = getComputedStyle(box);
      const target = box.clientWidth - parseFloat(cs.paddingLeft) - parseFloat(cs.paddingRight);
      if (w) el.style.fontSize = `${Math.min((100 * target) / w, max)}px`;
    };
    fit();
    document.fonts?.ready.then(fit);
    const ro = new ResizeObserver(fit);
    ro.observe(box);
    return () => ro.disconnect();
  }, [max]);
  return (
    <span ref={ref} className={`block w-max whitespace-nowrap ${className}`}>
      {children}
    </span>
  );
}
