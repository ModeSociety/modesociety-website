"use client";

import { useRef } from "react";
import { gsap, prefersReducedMotion, useGSAP } from "@/lib/gsap";
import type { SiteImage } from "@/lib/slots";

export function ParallaxImage({ image, className = "" }: { image?: SiteImage; className?: string }) {
  const ref = useRef<HTMLDivElement>(null);
  useGSAP(
    () => {
      if (prefersReducedMotion()) return;
      gsap.fromTo(ref.current!.querySelector("img"), { yPercent: -8, scale: 1.15 }, {
        yPercent: 8,
        ease: "none",
        scrollTrigger: { trigger: ref.current, start: "top bottom", end: "bottom top", scrub: true },
      });
      gsap.from(ref.current, { clipPath: "inset(100% 0 0 0)", duration: 1.6, ease: "expo.inOut", delay: 0.2 });
    },
    { scope: ref },
  );
  if (!image) return null;
  return (
    <div ref={ref} className={`overflow-hidden ${className}`} style={{ clipPath: "inset(0 0 0 0)" }}>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src={image.src} alt={image.alt} className="h-full w-full object-cover" />
    </div>
  );
}

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
          scrollTrigger: { trigger: li, start: "top 75%", end: "top 45%", scrub: true },
        });
        gsap.fromTo(li.querySelector(".txt"), { opacity: 1 }, {
          opacity: 0.3,
          ease: "none",
          scrollTrigger: { trigger: li, start: "top 60%", end: "top 45%", scrub: true },
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

/** Pinned horizontal-scrolling gallery on desktop; swipeable strip on mobile. */
export function HorizontalGallery({ images }: { images: SiteImage[] }) {
  const ref = useRef<HTMLElement>(null);
  const track = useRef<HTMLDivElement>(null);
  useGSAP(
    () => {
      if (prefersReducedMotion()) return;
      const mm = gsap.matchMedia();
      mm.add("(min-width: 768px)", () => {
        const distance = () => track.current!.scrollWidth - window.innerWidth;
        gsap.to(track.current, {
          x: () => -distance(),
          ease: "none",
          scrollTrigger: { trigger: ref.current, start: "top top", end: () => `+=${distance()}`, scrub: 0.6, pin: true, invalidateOnRefresh: true },
        });
        gsap.utils.toArray<HTMLElement>(".hg-item").forEach((el, i) => {
          gsap.fromTo(el, { rotate: i % 2 ? 3 : -3 }, { rotate: i % 2 ? -2 : 2, ease: "none", scrollTrigger: { trigger: ref.current, start: "top top", end: () => `+=${distance()}`, scrub: true } });
        });
      });
    },
    { scope: ref },
  );
  if (!images.length) return null;
  return (
    <section ref={ref} className="overflow-hidden md:h-[100svh]">
      <div ref={track} className="flex h-full items-center gap-6 overflow-x-auto px-[var(--gutter)] py-16 md:gap-10 md:overflow-visible md:py-0">
        <div className="w-[70vw] shrink-0 md:w-[32vw]">
          <p className="eyebrow">(03) On set</p>
          <h2 className="font-display mt-4 text-[clamp(28px,4vw,60px)]">
            Quality <span className="font-serif italic tracking-normal">over</span> volume.
          </h2>
        </div>
        {images.map((img, i) => (
          <figure key={i} className="hg-item polaroid !relative shrink-0" style={{ ["--w" as string]: "min(62vw, 340px)" }}>
            <span className="pin" style={{ ["--pin-color" as string]: i % 2 ? "#b08d57" : "#c3362b" }} />
            <div className="photo">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={img.src} alt={img.alt} loading="lazy" />
            </div>
            <figcaption className="caption">
              <span>No. {String(i + 1).padStart(2, "0")}</span>
            </figcaption>
          </figure>
        ))}
        <div className="w-[10vw] shrink-0" />
      </div>
    </section>
  );
}
