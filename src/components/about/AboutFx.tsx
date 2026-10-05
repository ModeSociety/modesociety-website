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
    <ul ref={ref} className="divide-y divide-line border-y border-line">
      {items.map((t, i) => (
        <li key={t} className="flex items-baseline gap-6 py-6 md:py-8">
          <span className="font-serif w-10 text-lg italic text-muted">0{i + 1}</span>
          <span className="relative">
            <span className="txt font-display text-[clamp(24px,4vw,58px)]">{t}</span>
            <span className="strike absolute left-0 right-0 top-[52%] h-[3px] origin-left bg-pin" style={{ transform: "scaleX(1)" }} />
          </span>
        </li>
      ))}
    </ul>
  );
}
