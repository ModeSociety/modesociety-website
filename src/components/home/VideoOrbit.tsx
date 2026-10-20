"use client";

import { useEffect, useRef } from "react";
import { prefersReducedMotion } from "@/lib/gsap";
import type { SiteImage } from "@/lib/slots";

/**
 * A 3D ring of creator videos (or photos) that slowly orbits. Drag to spin it;
 * videos play muted on loop, and only the ones facing forward keep playing.
 */
export default function VideoOrbit({ items, className = "" }: { items: SiteImage[]; className?: string }) {
  const stage = useRef<HTMLDivElement>(null);
  const ring = useRef<HTMLDivElement>(null);
  const list = items.slice(0, 10);
  const n = Math.max(list.length, 1);

  useEffect(() => {
    const el = stage.current;
    const r = ring.current;
    if (!el || !r) return;
    const cards = Array.from(r.children) as HTMLElement[];
    const videos = cards.map((c) => c.querySelector("video"));
    const reduced = prefersReducedMotion();
    let angle = 0;
    let vel = reduced ? 0 : 9; // degrees per second
    let drag: null | { x: number; id: number } = null;
    let raf = 0;
    let last = performance.now();
    let visible = true;

    const layout = () => {
      const w = el.clientWidth;
      // keep the whole ring roughly within the stage so it never spills over neighbouring content
      const cardW = Math.min(w * 0.42, 220, (w / ((n * 1.15) / Math.PI + 1)) * 1.35);
      const radius = Math.max(cardW * 0.9, (n * cardW) / (2 * Math.PI) * 1.15);
      cards.forEach((c, i) => {
        c.style.width = `${cardW}px`;
        c.style.marginLeft = `${-cardW / 2}px`;
        c.dataset.base = String((360 / n) * i);
        c.dataset.radius = String(radius);
      });
    };
    layout();
    const ro = new ResizeObserver(layout);
    ro.observe(el);
    const io = new IntersectionObserver(([e]) => (visible = e.isIntersecting));
    io.observe(el);

    const tick = (now: number) => {
      const dt = Math.min((now - last) / 1000, 0.05);
      last = now;
      if (!drag) {
        angle += vel * dt;
        vel += ((reduced ? 0 : 9) - vel) * Math.min(dt * 1.2, 1);
      }
      cards.forEach((c, i) => {
        const a = Number(c.dataset.base) + angle;
        const rad = (a * Math.PI) / 180;
        const facing = Math.cos(rad); // 1 = front, -1 = back
        c.style.transform = `rotateY(${a}deg) translateZ(${c.dataset.radius}px)`;
        c.style.opacity = String(0.35 + 0.65 * ((facing + 1) / 2));
        c.style.zIndex = String(Math.round((facing + 1) * 50));
        const v = videos[i];
        if (v) {
          if (visible && facing > 0.2 && v.paused) v.play().catch(() => {});
          else if ((!visible || facing <= 0.2) && !v.paused) v.pause();
        }
      });
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);

    const down = (e: PointerEvent) => {
      drag = { x: e.clientX, id: e.pointerId };
      el.setPointerCapture(e.pointerId);
    };
    const move = (e: PointerEvent) => {
      if (!drag || drag.id !== e.pointerId) return;
      const dx = e.clientX - drag.x;
      drag.x = e.clientX;
      angle += dx * 0.35;
      vel = dx * 6;
    };
    const up = () => (drag = null);
    el.addEventListener("pointerdown", down);
    el.addEventListener("pointermove", move);
    el.addEventListener("pointerup", up);
    el.addEventListener("pointercancel", up);
    return () => {
      cancelAnimationFrame(raf);
      ro.disconnect();
      io.disconnect();
      el.removeEventListener("pointerdown", down);
      el.removeEventListener("pointermove", move);
      el.removeEventListener("pointerup", up);
      el.removeEventListener("pointercancel", up);
    };
  }, [n]);

  if (!list.length) return null;
  return (
    <div
      ref={stage}
      className={`relative h-[420px] select-none touch-pan-y overflow-x-clip md:h-[520px] ${className}`}
      style={{ perspective: "1200px" }}
    >
      <div ref={ring} className="absolute left-1/2 top-1/2 h-0 w-0" style={{ transformStyle: "preserve-3d", transform: "rotateX(-6deg)" }}>
        {list.map((m, i) => (
          <div key={`${m.src}-${i}`} className="absolute top-0 -translate-y-1/2 grain overflow-hidden bg-paper-2 shadow-[0_24px_40px_-24px_rgba(74,5,7,.55)]">
            <div className="aspect-[9/16] w-full">
              {m.type === "video" ? (
                <video src={m.src} muted loop playsInline preload="metadata" className="h-full w-full object-cover" aria-label={m.alt} />
              ) : (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={m.src} alt={m.alt} draggable={false} className="h-full w-full object-cover" loading="lazy" />
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
