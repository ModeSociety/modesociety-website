"use client";

import { useEffect, useRef, useState } from "react";
import { prefersReducedMotion } from "@/lib/gsap";

const GLYPHS = "ABCDEFGHJKLMNPQRSTUVWXYZ0123456789#%&@/<>";

/**
 * Text that decodes into place like a game menu: each character cycles through random
 * glyphs and locks in, left to right. Runs once when it scrolls into view (or on load with
 * `immediate`). The real text is always in the DOM for screen readers and search.
 */
export default function Decode({ text, className = "", immediate = false, delay = 0 }: { text: string; className?: string; immediate?: boolean; delay?: number }) {
  const ref = useRef<HTMLSpanElement>(null);
  const [shown, setShown] = useState(text);

  useEffect(() => {
    const el = ref.current;
    if (!el || prefersReducedMotion()) return;
    let raf = 0;
    let timer = 0;
    const run = () => {
      const t0 = performance.now() + delay * 1000;
      const per = 28; // ms between characters locking in
      const step = (now: number) => {
        const k = now - t0;
        const locked = Math.max(0, Math.floor(k / per));
        let out = "";
        for (let i = 0; i < text.length; i++) {
          const ch = text[i];
          if (ch === " " || i < locked) out += ch;
          else out += GLYPHS[(Math.random() * GLYPHS.length) | 0];
        }
        setShown(out);
        if (locked < text.length) raf = requestAnimationFrame(step);
      };
      raf = requestAnimationFrame(step);
    };
    if (immediate) {
      timer = window.setTimeout(run, 0);
    } else {
      const io = new IntersectionObserver(
        ([e]) => {
          if (!e.isIntersecting) return;
          io.disconnect();
          run();
        },
        { threshold: 0.4 },
      );
      io.observe(el);
      return () => {
        io.disconnect();
        cancelAnimationFrame(raf);
      };
    }
    return () => {
      clearTimeout(timer);
      cancelAnimationFrame(raf);
    };
  }, [text, immediate, delay]);

  return (
    <span ref={ref} className={className}>
      <span className="sr-only">{text}</span>
      <span aria-hidden>{shown}</span>
    </span>
  );
}
