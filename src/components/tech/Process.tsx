"use client";

import { useRef } from "react";
import { gsap, prefersReducedMotion, useGSAP } from "@/lib/gsap";
import { TECH_PROCESS } from "@/lib/tech";

/**
 * "Our process" as a quest line: four levels along a track, a player marker that travels
 * from level to level, a CLEAR stamp on each, and an XP bar filling to 100%. Plays once
 * when it scrolls into view (so it's never caught half-done). Vertical on phones.
 */
export default function Process() {
  const ref = useRef<HTMLDivElement>(null);
  useGSAP(
    () => {
      if (prefersReducedMotion()) return;
      const steps = gsap.utils.toArray<HTMLElement>(".q-step");
      const mm = gsap.matchMedia();
      const build = (horizontal: boolean) => {
        const tl = gsap.timeline({ scrollTrigger: { trigger: ref.current, start: "top 70%", once: true } });
        const xp = { v: 0 };
        const pct = ref.current!.querySelector<HTMLElement>(".q-pct");
        tl.from(".q-xp", { scaleX: 0, duration: 2.6, ease: "power1.inOut" }, 0)
          .to(xp, { v: 100, duration: 2.6, ease: "power1.inOut", onUpdate: () => pct && (pct.textContent = `${Math.round(xp.v)}%`) }, 0)
          .from(".q-fill", horizontal ? { scaleX: 0, duration: 2.4, ease: "power1.inOut" } : { scaleY: 0, duration: 2.4, ease: "power1.inOut" }, 0.1)
          .fromTo(
            ".q-player",
            horizontal ? { left: "0%", top: "0%" } : { top: "0%", left: "0%" },
            { ...(horizontal ? { left: "100%" } : { top: "100%" }), duration: 2.4, ease: "power1.inOut" },
            0.1,
          );
        steps.forEach((el, i) => {
          const at = 0.1 + (i / Math.max(steps.length - 1, 1)) * 2.4;
          tl.from(el.querySelector(".q-body"), { y: 16, opacity: 0, duration: 0.6, ease: "expo.out" }, at - 0.15)
            .fromTo(el.querySelector(".q-node"), { backgroundColor: "#141824", boxShadow: "0 0 0 0 rgba(137,178,253,0)" }, { backgroundColor: "#3e5ef1", boxShadow: "0 0 30px 6px rgba(137,178,253,0.55)", duration: 0.35 }, at)
            .from(el.querySelector(".q-clear"), { scale: 2.2, opacity: 0, rotate: -18, duration: 0.45, ease: "back.out(2)" }, at + 0.1);
        });
      };
      mm.add("(min-width: 768px)", () => build(true));
      mm.add("(max-width: 767px)", () => build(false));
    },
    { scope: ref },
  );

  return (
    <div ref={ref}>
      {/* XP bar */}
      <div className="mb-12 flex items-center gap-4">
        <span className="tech-mono shrink-0 text-[11px] uppercase text-[#8c95a5]">Campaign XP</span>
        <span className="relative h-2.5 flex-1 overflow-hidden rounded-full bg-white/[0.07] shadow-[inset_0_0_0_1px_rgba(233,236,241,0.08)]">
          <span className="q-xp absolute inset-0 origin-left rounded-full bg-[linear-gradient(90deg,#3e5ef1,#89b2fd,#d0e0ff)] shadow-[0_0_16px_rgba(137,178,253,0.7)]" />
        </span>
        <span className="q-pct tech-display w-14 text-right text-[22px] text-white">100%</span>
      </div>

      <ol className="relative grid gap-12 md:grid-cols-4 md:gap-6">
        {/* the track and the player marker */}
        <span aria-hidden className="absolute left-[18px] top-[18px] h-[calc(100%-36px)] w-[2px] bg-white/10 md:left-[18px] md:top-[17px] md:h-[2px] md:w-[calc(75%+19px)]">
          <span className="q-fill absolute inset-0 origin-top bg-[linear-gradient(180deg,#89b2fd,#3e5ef1)] md:origin-left md:bg-[linear-gradient(90deg,#89b2fd,#3e5ef1)]" />
          <span className="q-player absolute left-full top-full hidden h-4 w-4 -translate-x-1/2 -translate-y-1/2 rotate-45 rounded-[3px] bg-white shadow-[0_0_20px_6px_rgba(137,178,253,0.8)] md:left-full md:top-0 md:block" />
        </span>
        {TECH_PROCESS.map((s, i) => (
          <li key={s.title} className="q-step relative pl-14 md:pl-0 md:pt-16">
            <span aria-hidden className="q-node absolute left-0 top-0 grid h-[38px] w-[38px] place-items-center rounded-[10px] bg-[#3e5ef1] text-white shadow-[inset_0_0_0_1px_rgba(137,178,253,0.7)]">
              <span className="tech-mono text-[10px]">LV{i + 1}</span>
            </span>
            <span aria-hidden className="q-clear tech-mono absolute right-0 top-[8px] rounded-full md:right-auto md:left-[50px] border border-[#89b2fd]/60 px-2 py-0.5 text-[9.5px] uppercase text-[#a9c6ff] md:top-[9px]">
              ✓ Clear
            </span>
            <div className="q-body">
              <span className="tech-mono text-[11px] text-[#89b2fd]">Level 0{i + 1}</span>
              <h3 className="tech-display mt-2 text-[clamp(28px,2.4vw,36px)] text-white">{s.title}</h3>
              <p className="mt-3 text-[14.5px] leading-relaxed text-[#aab2c0]">{s.body}</p>
            </div>
          </li>
        ))}
      </ol>
    </div>
  );
}
