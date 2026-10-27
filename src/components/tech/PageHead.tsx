"use client";

import { useRef } from "react";
import { gsap, prefersReducedMotion, useGSAP } from "@/lib/gsap";
import { Eyebrow } from "./ui";

/** The top of a Tech sub-page: eyebrow, a wide headline, a lead, and a giant outlined word behind. */
export default function PageHead({ eyebrow, title, lead, ghost, children }: { eyebrow: string; title: string; lead?: string; ghost?: string; children?: React.ReactNode }) {
  const ref = useRef<HTMLElement>(null);
  useGSAP(
    () => {
      if (prefersReducedMotion()) return;
      gsap
        .timeline()
        .from(".ph-letter", { yPercent: 110, duration: 1, ease: "expo.out", stagger: 0.025 })
        .from(".ph-fade", { y: 16, opacity: 0, duration: 0.8, ease: "expo.out", stagger: 0.08 }, "-=0.7")
        .from(".ph-ghost", { opacity: 0, y: 40, duration: 1.6, ease: "expo.out" }, 0);
    },
    { scope: ref },
  );
  return (
    <section ref={ref} className="relative overflow-hidden pb-16 pt-32 md:pb-20 md:pt-40">
      <div aria-hidden className="pointer-events-none absolute inset-0 bg-[radial-gradient(60%_55%_at_80%_0%,rgba(62,94,241,0.2),transparent_70%)]" />
      {ghost && (
        <div aria-hidden className="ph-ghost t-ghost-word absolute -right-[2vw] top-16 text-[clamp(140px,26vw,420px)]">
          {ghost}
        </div>
      )}
      <div className="wrap relative">
        <Eyebrow className="ph-fade">{eyebrow}</Eyebrow>
        <h1 className="tech-wide mt-4 max-w-5xl text-[clamp(44px,7vw,108px)] text-white">
          {title.split(" ").map((w, i) => (
            <span key={i} className="inline-block overflow-hidden pb-[0.06em] align-bottom">
              <span className="ph-letter inline-block">{w}&nbsp;</span>
            </span>
          ))}
        </h1>
        {lead && <p className="ph-fade mt-6 max-w-2xl text-[clamp(17px,1.4vw,20px)] leading-relaxed text-[#d2d8e2]">{lead}</p>}
        {children && <div className="ph-fade mt-8">{children}</div>}
      </div>
    </section>
  );
}
