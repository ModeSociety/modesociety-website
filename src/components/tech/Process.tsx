"use client";

import { useRef } from "react";
import { gsap, prefersReducedMotion, useGSAP } from "@/lib/gsap";
import { TECH_PROCESS } from "@/lib/tech";

/**
 * "Our process": four steps on a beam. When the steps scroll into view the beam fills
 * and each node lights up as it arrives (once, so the page never sits half-lit).
 * Vertical on phones, horizontal from tablet up.
 */
export default function Process() {
  const ref = useRef<HTMLOListElement>(null);
  useGSAP(
    () => {
      if (prefersReducedMotion()) return;
      const mm = gsap.matchMedia();
      const build = (axis: "x" | "y") => {
        const tl = gsap.timeline({ scrollTrigger: { trigger: ref.current, start: "top 70%", once: true } });
        tl.fromTo(".p-fill", axis === "x" ? { scaleX: 0 } : { scaleY: 0 }, { ...(axis === "x" ? { scaleX: 1 } : { scaleY: 1 }), ease: "power1.inOut", duration: 1.8 }, 0);
        gsap.utils.toArray<HTMLElement>(".p-step").forEach((el, i, all) => {
          const at = (i / Math.max(all.length - 1, 1)) * 1.6;
          tl.from(el, { y: 14, opacity: 0, duration: 0.6, ease: "expo.out" }, at);
          tl.fromTo(el.querySelector(".p-node"), { backgroundColor: "#141824", boxShadow: "0 0 0 0 rgba(137,178,253,0)" }, { backgroundColor: "#a9c6ff", boxShadow: "0 0 24px 4px rgba(137,178,253,0.6)", duration: 0.4 }, at);
        });
      };
      mm.add("(min-width: 768px)", () => build("x"));
      mm.add("(max-width: 767px)", () => build("y"));
    },
    { scope: ref },
  );

  return (
    <ol ref={ref} className="relative grid gap-10 md:grid-cols-4 md:gap-6">
      {/* the beam */}
      <span aria-hidden className="absolute left-[11px] top-3 h-[calc(100%-24px)] w-px bg-white/10 md:left-0 md:top-[11px] md:h-px md:w-full">
        <span className="p-fill absolute inset-0 origin-top bg-[linear-gradient(180deg,#89b2fd,#3e5ef1)] md:origin-left md:bg-[linear-gradient(90deg,#89b2fd,#3e5ef1)]" />
      </span>
      {TECH_PROCESS.map((s, i) => (
        <li key={s.title} className="p-step relative pl-10 md:pl-0 md:pt-12">
          <span aria-hidden className="p-node absolute left-0 top-0 grid h-[23px] w-[23px] place-items-center rounded-full bg-[#141824] shadow-[inset_0_0_0_1px_rgba(137,178,253,0.6)] md:top-0">
            <span className="h-1.5 w-1.5 rounded-full bg-[#07080c]" />
          </span>
          <span className="tech-mono text-[11px] text-[#89b2fd]">0{i + 1}</span>
          <h3 className="tech-display mt-2 text-[clamp(28px,2.4vw,36px)] text-white">{s.title}</h3>
          <p className="mt-3 text-[14.5px] leading-relaxed text-[#aab2c0]">{s.body}</p>
        </li>
      ))}
    </ol>
  );
}
