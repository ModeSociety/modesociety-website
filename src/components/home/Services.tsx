"use client";

import Link from "next/link";
import { useRef } from "react";
import { gsap, prefersReducedMotion, useGSAP } from "@/lib/gsap";
import type { SiteImage } from "@/lib/slots";
import type { ServiceCopy } from "@/lib/content";

export type Service = ServiceCopy & { image?: SiteImage };

/** A hand of cards that deals itself out as you scroll; each card flips on hover/tap. */
export default function Services({ services }: { services: Service[] }) {
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
        <div className="svc-heading mb-10 flex flex-col justify-between gap-6 md:mb-14 md:flex-row md:items-end">
          <h2 className="font-display flex flex-col text-[clamp(32px,5vw,72px)]">
            <span className="reveal-line"><span>What we</span></span>
            <span className="reveal-line"><span className="font-serif italic tracking-normal">bring to the table.</span></span>
          </h2>
          <p className="max-w-sm text-ink-2">
            We work selectively, so it&apos;s the right talent every time rather than the whole roster. Hover a card to turn it over.
          </p>
        </div>
        <div className="-mx-[var(--gutter)] flex snap-x snap-mandatory gap-4 overflow-x-auto px-[var(--gutter)] pb-4 md:mx-0 md:grid md:grid-cols-5 md:overflow-visible md:px-0">
          {services.map((s, i) => (
            <div key={s.key} className="svc-card flip group aspect-[3/4] w-[70vw] shrink-0 snap-center md:w-auto" data-cursor="flip" tabIndex={0}>
              <div className="flip-inner group-hover:[transform:rotateY(180deg)] group-focus:[transform:rotateY(180deg)]">
                <div className="flip-face overflow-hidden bg-paper-2 shadow-[0_20px_40px_-24px_rgba(0,0,0,.5)]">
                  {s.image && (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={s.image.src} alt={s.image.alt} className="h-full w-full object-cover" loading="lazy" />
                  )}
                  <span className="font-serif absolute left-4 top-3 text-lg italic text-paper drop-shadow">0{i + 1}</span>
                  <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/75 to-transparent p-4 pt-16 text-paper">
                    <h3 className="font-display text-[clamp(13px,1.1vw,17px)]">{s.title}</h3>
                  </div>
                </div>
                <div className="flip-face flip-back flex flex-col justify-between bg-ink p-6 text-paper">
                  <span className="font-serif text-2xl italic opacity-60">0{i + 1}</span>
                  <div>
                    <h3 className="font-display text-[clamp(14px,1.2vw,19px)]">{s.title}</h3>
                    <p className="mt-3 text-sm leading-relaxed text-paper/75">{s.body}</p>
                    <Link href="/work-with-us" className="mt-5 inline-block text-[11px] uppercase tracking-[0.18em] underline underline-offset-4">
                      Enquire →
                    </Link>
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
