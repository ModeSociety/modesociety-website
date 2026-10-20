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
        // plays once as the row comes into view, so it's never caught half-drawn
        const txt = li.querySelector(".txt");
        gsap
          .timeline({ scrollTrigger: { trigger: li, start: "top 82%", once: true } })
          .fromTo(txt, { backgroundSize: "0% 0.08em" }, { backgroundSize: "100% 0.08em", duration: 0.7, ease: "power2.inOut" })
          .fromTo(txt, { color: "rgba(127,9,13,1)" }, { color: "rgba(127,9,13,0.3)", duration: 0.5, ease: "none" }, "-=0.3");
      });
    },
    { scope: ref },
  );
  return (
    <ul ref={ref} className="divide-y divide-espresso/15 border-y border-espresso/15">
      {items.map((t, i) => (
        <li key={t} className="flex items-baseline gap-6 py-5 md:py-7">
          <span className="w-10 font-mono text-[11px] font-medium text-muted">/0{i + 1}</span>
          {/* struck through with a red rule per line; box-decoration-break repeats it on every wrapped line */}
          <span className="font-display text-[clamp(40px,7vw,112px)] leading-[1.02]">
            <span
              className="txt bg-no-repeat text-ink/30 [-webkit-box-decoration-break:clone] [box-decoration-break:clone]"
              style={{ backgroundImage: "linear-gradient(var(--red), var(--red))", backgroundPosition: "0 52%", backgroundSize: "100% 0.08em" }}
            >
              {t}
            </span>
          </span>
        </li>
      ))}
    </ul>
  );
}
