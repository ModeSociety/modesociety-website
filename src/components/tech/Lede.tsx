"use client";

import { useRef } from "react";
import { gsap, prefersReducedMotion, useGSAP } from "@/lib/gsap";

/** A big paragraph whose words light up one after another when it scrolls into view. */
export default function Lede({ text, className = "" }: { text: string; className?: string }) {
  const ref = useRef<HTMLParagraphElement>(null);
  useGSAP(
    () => {
      if (prefersReducedMotion()) return;
      gsap.fromTo(
        ref.current!.querySelectorAll(".w"),
        { color: "#5a6273" },
        { color: "#e9ecf1", duration: 0.6, stagger: 0.02, ease: "power1.out", scrollTrigger: { trigger: ref.current, start: "top 78%", once: true } },
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
