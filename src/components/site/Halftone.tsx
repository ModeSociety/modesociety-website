"use client";

import { useEffect, useRef } from "react";

const INK = "#7f090d"; // same as the solid footer below, so the two meet without a seam
const SPACING = 17; // px between dot centres

/**
 * The band above the footer: burgundy halftone dots on the page background, tiny at the top
 * and growing until they merge into solid burgundy at the bottom, where the footer begins.
 * Rows are offset like the reference. Fills its positioned parent.
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
      g.clearRect(0, 0, w, h);
      g.fillStyle = INK;

      const rowStep = SPACING * 0.866; // offset rows sit closer, like a hex grid
      const max = SPACING * 0.62; // past ~0.58·spacing neighbouring dots merge into solid colour
      for (let row = 0, y = h; y > -SPACING; row++, y -= rowStep) {
        const t = Math.min(1, Math.max(0, y / h)); // 0 at the top, 1 at the bottom
        const r = max * Math.pow(t, 1.35);
        if (r < 0.4) continue;
        for (let x = row % 2 ? SPACING / 2 : 0; x < w + SPACING; x += SPACING) {
          g.beginPath();
          g.arc(x, y, r, 0, Math.PI * 2);
          g.fill();
        }
      }
      g.fillRect(0, h - 2, w, 2); // close the last sliver so it meets the footer cleanly
    };
    draw();
    const ro = new ResizeObserver(draw);
    ro.observe(c);
    return () => ro.disconnect();
  }, []);

  return <canvas ref={ref} aria-hidden className={`pointer-events-none block h-full w-full ${className}`} />;
}
