"use client";

import { useEffect, useLayoutEffect, useRef } from "react";
import { gsap, prefersReducedMotion, useGSAP } from "@/lib/gsap";
import type { FooterStyle } from "@/lib/slots";

const WORD = "MODESOCIETY";

/**
 * The giant footer wordmark. It measures itself so the word exactly fills its container
 * (never clipped, whatever the screen), then reacts to the cursor per the admin setting.
 * Each letter has three layers: .ltr (cursor physics), .rise (scroll-in), .spin (click).
 */
export default function Wordmark({ style }: { style: FooterStyle }) {
  const box = useRef<HTMLDivElement>(null);
  const word = useRef<HTMLDivElement>(null);

  // Fit to width.
  useLayoutEffect(() => {
    const b = box.current;
    const w = word.current;
    if (!b || !w) return;
    const fit = () => {
      w.style.fontSize = "100px";
      const natural = w.scrollWidth;
      if (natural) w.style.fontSize = `${(100 * b.clientWidth) / natural}px`;
    };
    fit();
    const ro = new ResizeObserver(fit);
    ro.observe(b);
    document.fonts?.ready.then(fit);
    return () => ro.disconnect();
  }, []);

  useGSAP(
    () => {
      if (prefersReducedMotion()) return;
      gsap.from(box.current!.querySelectorAll(".rise"), {
        yPercent: 100,
        ease: "expo.out",
        stagger: 0.04,
        duration: 1.2,
        scrollTrigger: { trigger: box.current, start: "top 95%" },
      });
    },
    { scope: box },
  );

  useEffect(() => {
    if (style === "static" || prefersReducedMotion()) return;
    const letters = Array.from(box.current!.querySelectorAll<HTMLElement>(".ltr"));
    const state = letters.map(() => ({ y: 0, s: 1, a: 0, v: 0 }));
    const p = { x: -9999, y: -9999, vx: 0, inside: false };
    let last = performance.now();
    let raf = 0;

    const move = (e: PointerEvent) => {
      const r = box.current!.getBoundingClientRect();
      const x = e.clientX - r.left;
      p.vx = x - p.x;
      p.x = x;
      p.y = e.clientY - r.top;
      p.inside = p.y > -r.height * 1.2 && p.y < r.height * 1.4;
    };
    const click = (e: MouseEvent) => {
      const el = (e.target as HTMLElement).closest<HTMLElement>(".ltr");
      const i = el ? letters.indexOf(el) : -1;
      if (i < 0) return;
      if (style === "swing") state[i].v += (Math.random() > 0.5 ? 1 : -1) * 9;
      el!.querySelector(".spin")?.animate([{ transform: "rotateY(0)" }, { transform: "rotateY(360deg)" }], {
        duration: 900,
        easing: "cubic-bezier(.16,1,.3,1)",
      });
    };

    const tick = (now: number) => {
      const dt = Math.min((now - last) / 1000, 1 / 30);
      last = now;
      letters.forEach((el, i) => {
        const r = el.offsetLeft + el.offsetWidth / 2;
        const reach = el.offsetWidth * 2.2;
        const d = Math.abs(p.x - r);
        const f = p.inside && d < reach ? 1 - d / reach : 0;
        const st = state[i];
        if (style === "magnetic") {
          const ty = -f * f * el.offsetHeight * 0.22;
          const ts = 1 + f * f * 0.12;
          st.y += (ty - st.y) * Math.min(dt * 10, 1);
          st.s += (ts - st.s) * Math.min(dt * 10, 1);
          el.style.transform = `translateY(${st.y}px) scaleY(${st.s})`;
        } else {
          // swing: damped pendulum hanging from the letter's top edge
          st.v += (-30 * st.a - 1.6 * st.v + (f > 0 ? p.vx * 0.9 * f : 0)) * dt;
          st.a += st.v * dt;
          st.a = Math.max(-0.6, Math.min(0.6, st.a));
          el.style.transform = `rotate(${st.a}rad)`;
        }
      });
      p.vx *= 0.8;
      raf = requestAnimationFrame(tick);
    };

    addEventListener("pointermove", move, { passive: true });
    box.current!.addEventListener("click", click);
    const el = box.current!;
    raf = requestAnimationFrame(tick);
    return () => {
      removeEventListener("pointermove", move);
      el.removeEventListener("click", click);
      cancelAnimationFrame(raf);
      letters.forEach((l) => (l.style.transform = ""));
    };
  }, [style]);

  return (
    <div ref={box} className="relative w-full select-none" aria-hidden data-cursor={style === "static" ? undefined : "play"}>
      <div ref={word} className="font-display flex w-max whitespace-nowrap leading-[1.12] text-paper" style={{ fontSize: "100px" }}>
        {WORD.split("").map((c, i) => (
          <span
            key={i}
            className="ltr inline-block"
            style={{ transformOrigin: style === "swing" ? "50% 0%" : "50% 100%", willChange: "transform" }}
          >
            <span className="block overflow-hidden pb-[0.04em]">
              <span className="rise inline-block">
                <span className="spin inline-block">{c}</span>
              </span>
            </span>
          </span>
        ))}
      </div>
    </div>
  );
}
