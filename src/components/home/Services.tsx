"use client";

import { useRef } from "react";
import { gsap, prefersReducedMotion, useGSAP } from "@/lib/gsap";
import { QUOTE, type ServiceCopy } from "@/lib/content";

export type Service = ServiceCopy;

/** A hand of cards that deals itself out as you scroll; each card flips on hover/tap. */
export default function Services({ services, showQuote = true }: { services: Service[]; showQuote?: boolean }) {
  const ref = useRef<HTMLElement>(null);

  useGSAP(
    () => {
      if (prefersReducedMotion()) return;
      const mm = gsap.matchMedia();
      mm.add("(min-width: 900px)", () => {
        const cards = gsap.utils.toArray<HTMLElement>(".svc-card");
        const mid = (cards.length - 1) / 2;
        gsap.set(cards, { xPercent: (i) => (mid - i) * 100, rotate: (i) => (i - mid) * 4, y: (i) => Math.abs(i - mid) * 12 });
        gsap.timeline({
          scrollTrigger: { trigger: ref.current, start: "top top", end: "+=110%", scrub: 0.8, pin: true },
        })
          .to(cards, { xPercent: 0, rotate: (i) => (i - mid) * 1.5, y: 0, ease: "power2.out", stagger: 0.02 })
          .from(".svc-heading .reveal-line > span", { yPercent: 110, stagger: 0.1, ease: "expo.out" }, 0);
      });
      mm.add("(max-width: 899px)", () => {
        gsap.from(".svc-card", { y: 60, opacity: 0, stagger: 0.08, duration: 1, ease: "expo.out", scrollTrigger: { trigger: ref.current, start: "top 75%" } });
      });
    },
    { scope: ref },
  );

  return (
    <section ref={ref} className="relative flex min-h-[100svh] flex-col justify-center overflow-hidden py-24">
      <div className="wrap">
        <div className="svc-heading mb-10 flex flex-col justify-between gap-8 md:mb-14 md:flex-row md:items-end">
          <h2 className="font-display flex flex-col text-[clamp(32px,5vw,72px)]">
            <span className="reveal-line"><span>What we</span></span>
            <span className="reveal-line"><span className="font-serif italic tracking-normal">bring to the table.</span></span>
          </h2>
          {showQuote && <p className="font-serif max-w-md text-[clamp(22px,2.2vw,32px)] leading-[1.2] text-ink">&ldquo;{QUOTE}&rdquo;</p>}
        </div>
        <div className="-mx-[var(--gutter)] flex snap-x snap-mandatory gap-4 overflow-x-auto px-[var(--gutter)] pb-4 md:mx-0 md:grid md:grid-cols-4 md:overflow-visible md:px-0">
          {services.map((s, i) => (
            <div key={s.key} className="svc-card flip group aspect-[3/4] w-[72vw] shrink-0 snap-center md:w-auto" data-cursor="flip" tabIndex={0}>
              <div className="flip-inner group-hover:[transform:rotateY(180deg)] group-focus-within:[transform:rotateY(180deg)]">
                <div className="flip-face flex flex-col justify-between rounded-[4px] border border-line bg-white p-6 shadow-[0_20px_40px_-26px_rgba(74,5,7,.45)]">
                  <span className="font-display text-[clamp(28px,3vw,44px)] text-ink">{String(i + 1).padStart(2, "0")}</span>
                  <div>
                    <h3 className="font-display text-[clamp(18px,1.7vw,26px)] text-ink">{s.title}</h3>
                    <span className="mt-4 block text-[11px] uppercase tracking-[0.18em] text-muted">Hover to read →</span>
                  </div>
                </div>
                <div className="flip-face flip-back flex flex-col justify-between overflow-hidden rounded-[4px] bg-ink p-6 text-white">
                  <span className="font-display text-[clamp(16px,1.3vw,20px)]">{s.title}</span>
                  <div>
                    <p className="text-[clamp(13px,1vw,15px)] leading-relaxed text-white/90">{s.body}</p>
                    {s.link && (
                      <a href={s.link.href} target="_blank" rel="noreferrer" className="mt-4 inline-block text-[12px] font-semibold uppercase tracking-[0.14em] underline underline-offset-4">
                        {s.link.label}
                      </a>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
