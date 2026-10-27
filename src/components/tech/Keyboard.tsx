"use client";

import { useEffect, useRef } from "react";
import { prefersReducedMotion } from "@/lib/gsap";

/**
 * The footer wordmark as a row of RGB keycaps: MODESOCIETY TECH. Keys light up in a
 * wave of blues around the cursor, press down under it, and a slow ripple runs across
 * them when nobody's near. Click a key to press it.
 */
export default function Keyboard({ text = "MODESOCIETY TECH" }: { text?: string }) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const keys = Array.from(el.querySelectorAll<HTMLElement>("[data-key]"));
    if (prefersReducedMotion()) return;
    let raf = 0, visible = false, px = -9999, py = -9999, last = 0;
    const centres = () => keys.map((k) => { const r = k.getBoundingClientRect(); return { x: r.left + r.width / 2, y: r.top + r.height / 2, w: r.width }; });
    let pos = centres();
    const onMove = (e: PointerEvent) => {
      px = e.clientX;
      py = e.clientY;
      last = performance.now();
    };
    const onScroll = () => (pos = centres());
    const io = new IntersectionObserver(([e]) => {
      visible = e.isIntersecting;
      if (visible) pos = centres();
    });
    io.observe(el);
    addEventListener("pointermove", onMove, { passive: true });
    addEventListener("scroll", onScroll, { passive: true });
    addEventListener("resize", onScroll);

    const tick = (t: number) => {
      if (visible) {
        const idle = t - last > 1600;
        keys.forEach((k, i) => {
          const c = pos[i];
          let glow: number;
          if (idle) {
            // idle ripple left → right
            glow = Math.max(0, Math.sin(t * 0.002 - i * 0.55)) ** 3 * 0.8;
          } else {
            const d = Math.hypot(px - c.x, py - c.y) / (c.w * 2.6);
            glow = Math.max(0, 1 - d);
          }
          const hue = 218 + Math.sin(t * 0.001 + i * 0.4) * 14; // blues, drifting
          k.style.setProperty("--g", glow.toFixed(3));
          k.style.setProperty("--h", hue.toFixed(1));
        });
      }
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => {
      cancelAnimationFrame(raf);
      io.disconnect();
      removeEventListener("pointermove", onMove);
      removeEventListener("scroll", onScroll);
      removeEventListener("resize", onScroll);
    };
  }, []);

  // one row per word on phones (keys stay a readable size), one long row from md up
  const words = text.split(" ");
  const longest = Math.max(...words.map((w) => w.length));
  let n = 0;
  return (
    <div ref={ref} className="flex w-full flex-col gap-[1.6vw] md:flex-row md:gap-[0.6%]" aria-label={text} role="img" style={{ ["--keys" as string]: longest }}>
      {words.map((word, wi) => (
        <div key={wi} className="flex gap-[1.2vw] md:contents">
          {wi > 0 && <span aria-hidden className="hidden shrink-0 md:block md:w-[2.4%]" />}
          {word.split("").map((c) => {
            const i = n++;
            return (
              <button
                key={i}
                type="button"
                tabIndex={-1}
                aria-hidden
                data-key
                onPointerDown={(e) => e.currentTarget.animate([{ translate: "0 0" }, { translate: "0 8%" }, { translate: "0 0" }], { duration: 220, easing: "ease-out" })}
                className="relative aspect-[0.86] w-[calc((100%-(var(--keys)-1)*1.2vw)/var(--keys))] shrink-0 rounded-[12%] [container-type:inline-size] md:w-auto md:min-w-0 md:flex-1 md:shrink"
                style={{
                  background: "linear-gradient(180deg,#1a1f2c,#0f121a)",
                  boxShadow:
                    "inset 0 -6cqw 0 rgba(0,0,0,0.45), inset 0 0 0 1px rgba(233,236,241,0.1), 0 0 calc(var(--g,0) * 22cqw) hsla(var(--h,220),95%,65%,calc(var(--g,0) * 0.9))",
                  translate: "0 calc(var(--g,0) * 3.5%)",
                }}
              >
                <span
                  className="tech-display absolute inset-0 grid place-items-center pb-[8cqw] text-[78cqw] leading-none"
                  style={{ color: "hsl(var(--h,220) 90% calc(78% + var(--g,0) * 18%))", textShadow: "0 0 calc(var(--g,0) * 18cqw) hsla(var(--h,220),100%,70%,0.9)" }}
                >
                  {c}
                </span>
              </button>
            );
          })}
        </div>
      ))}
    </div>
  );
}
