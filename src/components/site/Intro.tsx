"use client";

import { useEffect, useRef, useState } from "react";
import { gsap, prefersReducedMotion } from "@/lib/gsap";
import { setIntroPlaying } from "@/lib/intro";
import type { IntroStyle } from "@/lib/slots";

const KEY = "ms-intro-seen";

/** Plays once per browser session. */
export default function Intro({ style }: { style: IntroStyle }) {
  const [show, setShow] = useState(false);
  const curtain = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (style === "none" || prefersReducedMotion()) return;
    try {
      if (sessionStorage.getItem(KEY)) return;
      sessionStorage.setItem(KEY, "1");
    } catch {
      /* storage blocked — just play it */
    }
    setIntroPlaying(true);
    // eslint-disable-next-line react-hooks/set-state-in-effect -- sessionStorage is browser-only
    setShow(true);
  }, [style]);

  useEffect(() => {
    if (!show || style !== "curtain" || !curtain.current) return;
    const el = curtain.current;
    const letters = el.querySelectorAll(".intro-letter");
    const tl = gsap.timeline({ onComplete: () => setShow(false) });
    tl.from(letters, { yPercent: 110, duration: 0.9, ease: "expo.out", stagger: 0.035 })
      .from(el.querySelector(".intro-sub"), { opacity: 0, y: 10, duration: 0.6 }, "-=0.4")
      .to(letters, { yPercent: -110, duration: 0.6, ease: "expo.in", stagger: 0.02 }, "+=0.5")
      .to(el.querySelector(".intro-sub"), { opacity: 0, duration: 0.3 }, "<")
      // the hero starts its drop as the curtain begins to lift
      .call(() => setIntroPlaying(false), [], "-=0.2")
      .to(el, { clipPath: "inset(0 0 100% 0)", duration: 1, ease: "expo.inOut" }, "<");
    return () => {
      tl.revert();
      setIntroPlaying(false);
    };
  }, [show, style]);

  if (!show) return null;
  if (style === "develop")
    return (
      <div
        className="intro-develop"
        aria-hidden
        ref={() => {
          const t = setTimeout(() => setIntroPlaying(false), 700);
          return () => clearTimeout(t);
        }}
        onAnimationEnd={() => {
          setIntroPlaying(false);
          setShow(false);
        }}
      />
    );

  return (
    <div ref={curtain} className="intro-curtain" style={{ clipPath: "inset(0 0 0% 0)" }} aria-hidden>
      <div className="text-center">
        <div className="font-display reveal-line text-[8vw] leading-[1.15] md:text-[6vw]">
          {"MODE SOCIETY".split("").map((c, i) => (
            <span key={i} className="intro-letter inline-block">
              {c === " " ? " " : c}
            </span>
          ))}
        </div>
        <p className="intro-sub font-serif mt-2 text-xl italic opacity-80 md:text-2xl">talent, curated.</p>
      </div>
    </div>
  );
}
