"use client";

import { useRef } from "react";
import { gsap, prefersReducedMotion, useGSAP } from "@/lib/gsap";
import type { Animation } from "@/lib/blocks";

/**
 * Plays a block's animation as it scrolls into view (once), or, for parallax, ties its photos
 * to the scroll. Photos are marked `data-photo`; nothing moves for people who prefer less motion.
 */
export default function Animated({ kind, from = "left", className = "", children }: { kind: Animation; from?: "left" | "right"; className?: string; children: React.ReactNode }) {
  const ref = useRef<HTMLDivElement>(null);
  useGSAP(
    () => {
      const el = ref.current;
      if (!el || kind === "none" || prefersReducedMotion()) return;
      const photos = el.querySelectorAll("[data-photo]");
      const trigger = { trigger: el, start: "top 85%", once: true };
      // the transform is cleared afterwards, so pinned and sticky parts inside still work
      const done = { clearProps: "transform,opacity" };
      if (kind === "fade") gsap.from(el.children, { y: 40, opacity: 0, duration: 1.1, ease: "expo.out", stagger: 0.08, scrollTrigger: trigger, ...done });
      if (kind === "slide") gsap.from(el.children, { x: from === "right" ? 80 : -80, opacity: 0, duration: 1.2, ease: "expo.out", stagger: 0.1, scrollTrigger: trigger, ...done });
      if (kind === "zoom") gsap.from(el.children, { scale: 0.92, opacity: 0, duration: 1.2, ease: "expo.out", stagger: 0.08, scrollTrigger: trigger, ...done });
      if (kind === "reveal") {
        gsap.fromTo(photos, { clipPath: "inset(0 0 100% 0)" }, { clipPath: "inset(0 0 0% 0)", duration: 1.3, ease: "expo.inOut", stagger: 0.12, scrollTrigger: trigger, clearProps: "clipPath" });
        gsap.from(el.querySelectorAll("[data-words]"), { y: 24, opacity: 0, duration: 1, ease: "expo.out", delay: 0.3, scrollTrigger: trigger });
      }
      if (kind === "parallax") {
        photos.forEach((p, i) =>
          gsap.fromTo(p, { y: 50 + i * 15 }, { y: -50 - i * 15, ease: "none", scrollTrigger: { trigger: el, start: "top bottom", end: "bottom top", scrub: true } }),
        );
        gsap.from(el.querySelectorAll("[data-words]"), { y: 30, opacity: 0, duration: 1, ease: "expo.out", scrollTrigger: trigger });
      }
    },
    { scope: ref, dependencies: [kind] },
  );
  return (
    <div ref={ref} className={className}>
      {children}
    </div>
  );
}
