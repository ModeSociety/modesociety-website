"use client";

import { useEffect, useRef } from "react";
import { prefersReducedMotion } from "@/lib/gsap";
import type { SiteImage } from "@/lib/slots";

/**
 * "Brands our creators have worked with": logos drift around the section on their own,
 * bouncing off the edges and each other's paths. Not controlled by hover.
 */
export default function Clients({ logos }: { logos: SiteImage[] }) {
  const field = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const box = field.current;
    if (!box || !logos.length) return;
    const els = Array.from(box.children) as HTMLElement[];
    const reduced = prefersReducedMotion();
    const W = () => box.clientWidth;
    const H = () => box.clientHeight;
    const cols = Math.ceil(Math.sqrt(els.length * (W() / Math.max(H(), 1))));
    const rows = Math.ceil(els.length / cols);
    const state = els.map((_, i) => {
      const angle = Math.random() * Math.PI * 2;
      const speed = 14 + Math.random() * 16; // px per second
      return {
        // start on a loose grid so nothing overlaps at first
        x: ((i % cols) + 0.5) * (W() / cols),
        y: (Math.floor(i / cols) + 0.5) * (H() / rows),
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        rot: (Math.random() - 0.5) * 8,
        vr: (Math.random() - 0.5) * 4,
        phase: Math.random() * Math.PI * 2,
      };
    });
    let raf = 0;
    let last = performance.now();
    let visible = true;
    const io = new IntersectionObserver(([e]) => (visible = e.isIntersecting));
    io.observe(box);

    const tick = (now: number) => {
      const dt = Math.min((now - last) / 1000, 0.05);
      last = now;
      const w = W();
      const h = H();
      els.forEach((el, i) => {
        const s = state[i];
        if (visible && !reduced) {
          s.x += s.vx * dt;
          s.y += s.vy * dt + Math.sin(now / 1400 + s.phase) * 0.12;
          s.rot += s.vr * dt;
          const hw = el.offsetWidth / 2;
          const hh = el.offsetHeight / 2;
          if (s.x < hw || s.x > w - hw) {
            s.vx *= -1;
            s.x = Math.min(Math.max(s.x, hw), w - hw);
          }
          if (s.y < hh || s.y > h - hh) {
            s.vy *= -1;
            s.y = Math.min(Math.max(s.y, hh), h - hh);
          }
          if (Math.abs(s.rot) > 8) s.vr *= -1;
        }
        el.style.transform = `translate3d(${s.x - el.offsetWidth / 2}px, ${s.y - el.offsetHeight / 2}px, 0) rotate(${s.rot}deg)`;
      });
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => {
      cancelAnimationFrame(raf);
      io.disconnect();
    };
  }, [logos]);

  if (!logos.length) return null;

  return (
    <section className="py-20 md:py-28">
      <div className="wrap">
        <h2 className="font-display text-[clamp(52px,10vw,150px)] leading-none">Brands</h2>
        <p className="font-serif mt-2 text-[clamp(20px,2.4vw,34px)] italic">our creators have worked with</p>
      </div>
      <div ref={field} className="relative mx-auto mt-10 h-[min(70svh,560px)] w-full max-w-[1440px] overflow-hidden" aria-label="Brand logos">
        {logos.map((l, i) => (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            key={`${l.src}-${i}`}
            src={l.src}
            alt={l.alt}
            loading="lazy"
            draggable={false}
            // multiply makes any white logo background vanish into the page (Drive files aren't pre-processed)
            className="absolute left-0 top-0 h-[clamp(44px,6vw,84px)] w-auto max-w-[clamp(110px,16vw,220px)] object-contain mix-blend-multiply will-change-transform"
          />
        ))}
      </div>
    </section>
  );
}
