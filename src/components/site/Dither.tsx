"use client";

import { useEffect, useRef } from "react";

const BAYER = [
  [0, 32, 8, 40, 2, 34, 10, 42],
  [48, 16, 56, 24, 50, 18, 58, 26],
  [12, 44, 4, 36, 14, 46, 6, 38],
  [60, 28, 52, 20, 62, 30, 54, 22],
  [3, 35, 11, 43, 1, 33, 9, 41],
  [51, 19, 59, 27, 49, 17, 57, 25],
  [15, 47, 7, 39, 13, 45, 5, 37],
  [63, 31, 55, 23, 61, 29, 53, 21],
];
const PALETTE: [number, number, number][] = [
  [0x4a, 0x05, 0x07],
  [0x6a, 0x08, 0x0b],
  [0x7f, 0x09, 0x0d],
  [0x93, 0x1c, 0x21],
  [0xa9, 0x38, 0x3c],
];
const PIXEL = 3;

/**
 * Burgundy gradient with an ordered (Bayer) dither instead of a smooth blend.
 * Rendered at 1/3 resolution and scaled up with crisp pixels; fills its positioned parent.
 */
export default function Dither({ className = "" }: { className?: string }) {
  const ref = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const c = ref.current;
    if (!c) return;
    const draw = () => {
      const w = Math.max(1, Math.ceil(c.clientWidth / PIXEL));
      const h = Math.max(1, Math.ceil(c.clientHeight / PIXEL));
      if (c.width === w && c.height === h) return;
      c.width = w;
      c.height = h;
      const g = c.getContext("2d")!;
      const img = g.createImageData(w, h);
      const n = PALETTE.length - 1;
      for (let y = 0; y < h; y++) {
        for (let x = 0; x < w; x++) {
          const t = Math.min(1, Math.max(0, 0.08 + 0.62 * (x / w) + 0.5 * (y / h) - 0.18)) * n;
          let i = Math.floor(t);
          if (i < n && t - i > (BAYER[y & 7][x & 7] + 0.5) / 64) i++;
          const [r, gg, b] = PALETTE[i];
          const o = (y * w + x) * 4;
          img.data[o] = r;
          img.data[o + 1] = gg;
          img.data[o + 2] = b;
          img.data[o + 3] = 255;
        }
      }
      g.putImageData(img, 0, 0);
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
      style={{ imageRendering: "pixelated" }}
    />
  );
}
