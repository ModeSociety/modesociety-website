"use client";

import { useRef } from "react";
import { gsap, prefersReducedMotion, useGSAP } from "@/lib/gsap";

/** Words ink in one after another when the paragraph scrolls into view (once); they start in the muted tone, which is still readable. */
export function ScrubText({ text, className = "" }: { text: string; className?: string }) {
  const ref = useRef<HTMLParagraphElement>(null);
  useGSAP(
    () => {
      if (prefersReducedMotion()) return;
      gsap.fromTo(
        ref.current!.querySelectorAll(".w"),
        { color: "#8f5f61" },
        {
          color: "#7f090d",
          duration: 0.6,
          stagger: 0.025,
          ease: "power1.out",
          scrollTrigger: { trigger: ref.current, start: "top 80%", once: true },
        },
      );
    },
    { scope: ref },
  );
  return (
    <p ref={ref} className={className}>
      {text.split(" ").map((w, i) => (
        <span key={i} className="w">
          {w}{" "}
        </span>
      ))}
    </p>
  );
}

/** Lines slide up from a mask when they enter the viewport. */
export function RiseLines({
  lines,
  className = "",
  as: Tag = "h2",
  delay = 0,
  immediate = false,
}: {
  lines: React.ReactNode[];
  className?: string;
  as?: "h1" | "h2" | "h3" | "p" | "div";
  delay?: number;
  immediate?: boolean;
}) {
  const ref = useRef<HTMLHeadingElement>(null);
  useGSAP(
    () => {
      if (prefersReducedMotion()) return;
      gsap.from(ref.current!.querySelectorAll(".reveal-line > span"), {
        yPercent: 115,
        rotate: 2,
        duration: 1.2,
        ease: "expo.out",
        stagger: 0.09,
        delay,
        scrollTrigger: immediate ? undefined : { trigger: ref.current, start: "top 88%" },
      });
    },
    { scope: ref },
  );
  return (
    // flex column: stops the masks' negative margins collapsing, so line spacing is unchanged
    <Tag ref={ref} className={`flex flex-col ${className}`}>
      {lines.map((l, i) => (
        <span key={i} className="reveal-line">
          <span>{l}</span>
        </span>
      ))}
    </Tag>
  );
}

/** Fades & lifts children in on scroll. */
export function FadeUp({ children, className = "", delay = 0 }: { children: React.ReactNode; className?: string; delay?: number }) {
  const ref = useRef<HTMLDivElement>(null);
  useGSAP(
    () => {
      if (prefersReducedMotion()) return;
      gsap.from(ref.current, {
        y: 40,
        opacity: 0,
        duration: 1.1,
        delay,
        ease: "expo.out",
        scrollTrigger: { trigger: ref.current, start: "top 90%" },
      });
    },
    { scope: ref },
  );
  return (
    <div ref={ref} className={className}>
      {children}
    </div>
  );
}
