"use client";

import { useRef } from "react";
import { gsap, prefersReducedMotion, useGSAP } from "@/lib/gsap";

/** The industry frustrations get struck through one by one as you scroll. */
export function StrikeList({ items }: { items: string[] }) {
  const ref = useRef<HTMLUListElement>(null);
  useGSAP(
    () => {
      if (prefersReducedMotion()) return;
      ref.current!.querySelectorAll("li").forEach((li) => {
        gsap.fromTo(li.querySelector(".strike"), { scaleX: 0 }, {
          scaleX: 1,
          ease: "none",
          scrollTrigger: { trigger: li, start: "top 92%", end: "top 74%", scrub: 0.3 },
        });
        gsap.fromTo(li.querySelector(".txt"), { opacity: 1 }, {
          opacity: 0.3,
          ease: "none",
          scrollTrigger: { trigger: li, start: "top 84%", end: "top 74%", scrub: 0.3 },
        });
      });
    },
    { scope: ref },
  );
  return (
    <ul ref={ref} className="divide-y divide-espresso/15 border-y border-espresso/15">
      {items.map((t, i) => (
        <li key={t} className="flex items-baseline gap-6 py-5 md:py-7">
          <span className="w-10 font-mono text-[11px] font-medium text-muted">/0{i + 1}</span>
          <span className="relative">
            <span className="txt font-display text-[clamp(40px,7vw,112px)]">{t}</span>
            {/* a red marker line scratched through it */}
            <svg
              viewBox="0 0 200 24"
              preserveAspectRatio="none"
              aria-hidden
              className="strike absolute -left-[3%] top-[38%] h-[0.32em] w-[106%] origin-left overflow-visible text-red"
              style={{ transform: "scaleX(1)" }}
            >
              <path d="M2 15 C 50 8, 120 16, 198 9" fill="none" stroke="currentColor" strokeWidth={4} strokeLinecap="round" vectorEffect="non-scaling-stroke" />
            </svg>
          </span>
        </li>
      ))}
    </ul>
  );
}
