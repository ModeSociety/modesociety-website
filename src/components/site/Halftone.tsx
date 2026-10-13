"use client";

import { useEffect, useRef } from "react";

const BASE = "#8a1016";
const DOT = "#470406";
const SPACING = 13; // px between dot centres
const ANGLE = -0.42; // grid rotation (radians)

/**
 * Burgundy halftone, after the footer reference: dots grow toward the lower-left until they
 * merge into solid colour, shrinking to specks toward the upper-right, on gently curving rows.
 * Fills its positioned parent.
 */
export default function Halftone({ className = "" }: { className?: string }) {
  const ref = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const c = ref.current;
    if (!c) return;
    let lastW = 0;
    let lastH = 0;
    const draw = () => {
      const w = c.clientWidth;
      const h = c.clientHeight;
      if (!w || !h || (w === lastW && h === lastH)) return;
      lastW = w;
      lastH = h;
      const dpr = Math.min(devicePixelRatio || 1, 2);
      c.width = Math.round(w * dpr);
      c.height = Math.round(h * dpr);
      const g = c.getContext("2d")!;
      g.setTransform(dpr, 0, 0, dpr, 0, 0);
      g.fillStyle = BASE;
      g.fillRect(0, 0, w, h);
      g.fillStyle = DOT;

      const cos = Math.cos(ANGLE);
      const sin = Math.sin(ANGLE);
      const reach = Math.hypot(w, h);
      const max = SPACING * 0.74; // past half the spacing, neighbouring dots merge
      // walk a rotated grid big enough to cover the canvas
      for (let v = -reach; v < reach; v += SPACING) {
        for (let u = -reach; u < reach; u += SPACING) {
          const bend = (u / reach) * (u / reach) * 60; // rows curve like the reference
          const x = u * cos - (v + bend) * sin + w * 0.1;
          const y = u * sin + (v + bend) * cos + h * 0.5;
          if (x < -SPACING || x > w + SPACING || y < -SPACING || y > h + SPACING) continue;
          // 0 at the upper-right corner, 1 at the lower-left
          const t = Math.min(1, Math.max(0, ((w - x) / w) * 0.62 + (y / h) * 0.62 - 0.18));
          const r = max * Math.pow(t, 1.15);
          if (r < 0.35) continue;
          g.beginPath();
          g.arc(x, y, r, 0, Math.PI * 2);
          g.fill();
        }
      }
    };
    draw();
    const ro = new ResizeObserver(draw);
    ro.observe(c);
    return () => ro.disconnect();
  }, []);

  return (
    <canvas
      ref={ref}
      aria-hidden
      className={`pointer-events-none absolute inset-0 -z-10 h-full w-full ${className}`}
      style={{ backgroundColor: BASE }}
    />
  );
}
