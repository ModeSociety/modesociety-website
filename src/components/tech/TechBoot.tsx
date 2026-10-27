"use client";

import { useEffect, useState } from "react";
import { prefersReducedMotion } from "@/lib/gsap";
import { setIntroPlaying } from "@/lib/intro";

const KEY = "ms-tech-boot";
const LINES = ["modesociety.tech // boot", "loading roster …… ok", "linking brands …… ok", "region au → worldwide …… ok"];

/**
 * The Tech side's intro, once per browser session: a game-style boot screen (log lines,
 * a loading bar, PRESS START) that wipes away after ~1.8 s, or straight away on any key,
 * click or tap.
 */
export default function TechBoot() {
  const [show, setShow] = useState(false);
  const [phase, setPhase] = useState(0); // lines shown, then 99 = leaving

  useEffect(() => {
    if (prefersReducedMotion()) return;
    try {
      if (sessionStorage.getItem(KEY)) return;
      sessionStorage.setItem(KEY, "1");
    } catch {
      /* storage blocked: just play it */
    }
    setIntroPlaying(true);
    // eslint-disable-next-line react-hooks/set-state-in-effect -- sessionStorage is browser-only
    setShow(true);
  }, []);

  useEffect(() => {
    if (!show) return;
    const timers = LINES.map((_, i) => setTimeout(() => setPhase((p) => Math.max(p, i + 1)), 160 + i * 230));
    const leave = () => {
      setPhase(99);
      setIntroPlaying(false);
      setTimeout(() => setShow(false), 650);
    };
    const auto = setTimeout(leave, 1900);
    const skip = () => {
      clearTimeout(auto);
      leave();
    };
    addEventListener("keydown", skip, { once: true });
    addEventListener("pointerdown", skip, { once: true });
    return () => {
      timers.forEach(clearTimeout);
      clearTimeout(auto);
      removeEventListener("keydown", skip);
      removeEventListener("pointerdown", skip);
      setIntroPlaying(false);
    };
  }, [show]);

  if (!show) return null;
  const leaving = phase === 99;
  return (
    <div
      aria-hidden
      className="fixed inset-0 z-[300] grid place-items-center bg-[#05060a] transition-[clip-path] duration-[650ms] ease-[cubic-bezier(.65,0,.35,1)]"
      style={{ clipPath: leaving ? "inset(0 0 100% 0)" : "inset(0 0 0% 0)" }}
    >
      <div aria-hidden className="absolute inset-0 bg-[repeating-linear-gradient(0deg,rgba(255,255,255,0.025)_0_1px,transparent_1px_3px)]" />
      <div className="relative w-[min(86vw,520px)]">
        <ul className="tech-mono space-y-1.5 text-[12px] uppercase text-[#8c95a5]">
          {LINES.map((l, i) => (
            <li key={l} className={`transition-opacity duration-200 ${phase > i ? "opacity-100" : "opacity-0"}`}>
              <span className="text-[#89b2fd]">&gt;</span> {l}
            </li>
          ))}
        </ul>
        <div className="mt-6 h-1.5 overflow-hidden rounded-full bg-white/10">
          <div className="h-full rounded-full bg-[linear-gradient(90deg,#3e5ef1,#a9c6ff)] shadow-[0_0_14px_#89b2fd] transition-[width] duration-[1500ms] ease-out" style={{ width: phase ? "100%" : "4%" }} />
        </div>
        <p className="tech-wide t-live mt-8 text-center text-[clamp(22px,4vw,34px)] text-white">Press start</p>
      </div>
    </div>
  );
}
