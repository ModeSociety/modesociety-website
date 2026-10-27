"use client";

import { useEffect, useRef } from "react";
import { prefersReducedMotion } from "@/lib/gsap";

/**
 * The arena behind the Tech hero: a blue perspective grid running to a horizon, rolling
 * slowly toward the viewer, with stars above it. The floor bulges and lights up under the
 * cursor (or a finger). Canvas 2D, paused when off screen or when the tab is hidden.
 */
export default function GridFloor({ className = "", horizon = 0.56 }: { className?: string; horizon?: number }) {
  const ref = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const c = ref.current;
    if (!c) return;
    const g = c.getContext("2d")!;
    const reduced = prefersReducedMotion();
    let w = 0, h = 0, dpr = 1, raf = 0, visible = true;
    const pointer = { x: -9999, y: -9999, tx: -9999, ty: -9999, energy: 0 };
    // a fixed starfield (positions as fractions of the sky)
    const stars = Array.from({ length: 90 }, (_, i) => ({ x: (Math.sin(i * 91.7) + 1) / 2, y: (Math.sin(i * 47.3 + 1) + 1) / 2, s: 0.4 + ((i * 37) % 10) / 10, p: i }));

    const size = () => {
      const r = c.getBoundingClientRect();
      dpr = Math.min(devicePixelRatio || 1, 1.5);
      w = r.width;
      h = r.height;
      c.width = Math.round(w * dpr);
      c.height = Math.round(h * dpr);
      g.setTransform(dpr, 0, 0, dpr, 0, 0);
    };
    size();
    const ro = new ResizeObserver(size);
    ro.observe(c);

    const onMove = (e: PointerEvent) => {
      const r = c.getBoundingClientRect();
      pointer.tx = e.clientX - r.left;
      pointer.ty = e.clientY - r.top;
      pointer.energy = 1;
    };
    addEventListener("pointermove", onMove, { passive: true });
    const io = new IntersectionObserver(([e]) => (visible = e.isIntersecting));
    io.observe(c);

    const draw = (t: number) => {
      g.clearRect(0, 0, w, h);
      const hy = h * horizon;
      const vx = w / 2;
      pointer.x += (pointer.tx - pointer.x) * 0.12;
      pointer.y += (pointer.ty - pointer.y) * 0.12;
      pointer.energy *= 0.985;

      // stars
      for (const s of stars) {
        const tw = 0.35 + 0.65 * Math.abs(Math.sin(t * 0.0006 + s.p));
        g.fillStyle = `rgba(200,215,255,${0.5 * tw})`;
        g.fillRect(s.x * w, s.y * hy * 0.9, s.s, s.s);
      }
      // horizon glow
      const glow = g.createLinearGradient(0, hy - 90, 0, hy + 30);
      glow.addColorStop(0, "rgba(62,94,241,0)");
      glow.addColorStop(0.75, "rgba(62,94,241,0.28)");
      glow.addColorStop(1, "rgba(137,178,253,0)");
      g.fillStyle = glow;
      g.fillRect(0, hy - 90, w, 120);

      // bulge under the pointer: lifts the floor a little near it
      const active = pointer.energy > 0.01;
      const lift = (x: number, y: number) => {
        if (!active) return 0;
        const dx = x - pointer.x, dy = (y - pointer.y) * 1.6;
        const d2 = dx * dx + dy * dy;
        return -38 * pointer.energy * Math.exp(-d2 / 26000);
      };
      const near = (x: number, y: number) => {
        if (!active) return 0;
        const dx = x - pointer.x, dy = y - pointer.y;
        return Math.exp(-(dx * dx + dy * dy) / 30000) * pointer.energy;
      };

      // horizontal lines rolling toward the viewer
      const rows = 18;
      const roll = reduced ? 0 : ((t * 0.00012) % 1);
      for (let i = 0; i < rows; i++) {
        const k = (i + roll) / rows; // 0 at horizon → 1 at the bottom
        const y = hy + (h - hy) * Math.pow(k, 2.2);
        const a = Math.min(1, k * 1.6);
        g.beginPath();
        for (let x = 0; x <= w + 32; x += active ? 24 : w + 32) {
          const yy = y + lift(x, y) * k;
          if (x === 0) g.moveTo(x, yy);
          else g.lineTo(x, yy);
        }
        g.strokeStyle = `rgba(110,150,255,${0.28 * a})`;
        g.lineWidth = 1;
        g.stroke();
      }
      // vertical lines converging on the vanishing point
      const cols = 26;
      for (let j = -cols; j <= cols; j++) {
        const xb = vx + (j / cols) * w * 1.6;
        g.beginPath();
        for (let s = 0; s <= 1.0001; s += active ? 0.05 : 1) {
          const x = vx + (xb - vx) * s;
          const y = hy + (h - hy) * s;
          const yy = y + lift(x, y) * s;
          if (s === 0) g.moveTo(x, yy);
          else g.lineTo(x, yy);
        }
        const mid = near(vx + (xb - vx) * 0.7, hy + (h - hy) * 0.7);
        g.strokeStyle = `rgba(${110 + mid * 100},${150 + mid * 80},255,${0.22 + mid * 0.6})`;
        g.lineWidth = 1 + mid * 1.2;
        g.stroke();
      }
      // pointer light pool on the floor
      if (pointer.energy > 0.02 && pointer.y > hy) {
        const pool = g.createRadialGradient(pointer.x, pointer.y, 0, pointer.x, pointer.y, 220);
        pool.addColorStop(0, `rgba(137,178,253,${0.22 * pointer.energy})`);
        pool.addColorStop(1, "rgba(137,178,253,0)");
        g.fillStyle = pool;
        g.fillRect(pointer.x - 220, pointer.y - 220, 440, 440);
      }
      // fade the floor into the page at the bottom
      const fade = g.createLinearGradient(0, h * 0.8, 0, h);
      fade.addColorStop(0, "rgba(7,8,12,0)");
      fade.addColorStop(1, "rgba(7,8,12,1)");
      g.fillStyle = fade;
      g.fillRect(0, h * 0.8, w, h * 0.2);
    };

    const tick = (t: number) => {
      if (visible && !document.hidden) draw(t);
      raf = requestAnimationFrame(tick);
    };
    // one still frame straight away; the animation starts once the page is idle
    draw(0);
    const ric = (window as unknown as { requestIdleCallback?: (cb: () => void, o?: { timeout: number }) => number }).requestIdleCallback;
    const handle = reduced ? 0 : ric ? ric(() => (raf = requestAnimationFrame(tick)), { timeout: 2000 }) : window.setTimeout(() => (raf = requestAnimationFrame(tick)), 800);
    return () => {
      if (!reduced) {
        if (ric) (window as unknown as { cancelIdleCallback: (h: number) => void }).cancelIdleCallback(handle);
        else clearTimeout(handle);
      }
      cancelAnimationFrame(raf);
      ro.disconnect();
      io.disconnect();
      removeEventListener("pointermove", onMove);
    };
  }, [horizon]);

  return <canvas ref={ref} aria-hidden className={`pointer-events-none block h-full w-full ${className}`} />;
}
