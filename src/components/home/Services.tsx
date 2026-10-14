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
    <section ref={ref} className="relative flex min-h-[100svh] flex-col justify-center overflow-hidden bg-ink py-24 text-white">
      <div className="wrap">
        <div className="svc-heading mb-10 flex flex-col justify-between gap-8 md:mb-14 md:flex-row md:items-end">
          <h2 className="font-display flex flex-col text-[clamp(32px,5vw,72px)]">
            <span className="reveal-line"><span>What we</span></span>
            <span className="reveal-line"><span className="font-serif italic tracking-normal">bring to the table.</span></span>
          </h2>
          {showQuote && <p className="font-serif max-w-md text-[clamp(22px,2.2vw,32px)] leading-[1.2] text-white/90">&ldquo;{QUOTE}&rdquo;</p>}
        </div>
        <div className="-mx-[var(--gutter)] flex snap-x snap-mandatory gap-4 overflow-x-auto px-[var(--gutter)] pb-4 md:mx-0 md:grid md:grid-cols-4 md:overflow-visible md:px-0">
          {services.map((s, i) => (
            <div key={s.key} className="svc-card flip group aspect-[3/4] w-[72vw] shrink-0 snap-center md:w-auto" tabIndex={0}>
              <div className="flip-inner group-hover:[transform:rotateY(180deg)] group-focus-within:[transform:rotateY(180deg)]">
                <div className="flip-face flex flex-col justify-between rounded-[4px] bg-white p-6 shadow-[0_24px_48px_-24px_rgba(0,0,0,.55)]">
                  <span className="font-display text-[clamp(48px,14vw,72px)] leading-none text-ink md:text-[clamp(28px,3vw,44px)]">{String(i + 1).padStart(2, "0")}</span>
                  <div>
                    <h3 className="font-display text-[clamp(30px,9vw,44px)] text-ink md:text-[clamp(18px,1.7vw,26px)]">{s.title}</h3>
                    <span className="mt-4 block text-[12px] uppercase tracking-[0.18em] text-muted md:text-[11px]">
                      <span className="md:hidden">Tap to read →</span>
                      <span className="hidden md:inline">Hover to read →</span>
                    </span>
                  </div>
                </div>
                <div className="flip-face flip-back flex flex-col justify-between overflow-hidden rounded-[4px] bg-ink-deep p-6 text-white ring-1 ring-white/15">
                  <span className="font-display text-[clamp(22px,6.5vw,28px)] md:text-[clamp(16px,1.3vw,20px)]">{s.title}</span>
                  <div>
                    <p className="text-[clamp(15px,4.2vw,17px)] leading-relaxed text-white/90 md:text-[clamp(13px,1vw,15px)]">{s.body}</p>
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
