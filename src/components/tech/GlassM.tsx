"use client";

import { useEffect, useId, useRef } from "react";
import { prefersReducedMotion } from "@/lib/gsap";
import { M_PATH, M_WINDOW } from "./mark-paths";

/**
 * The hero centrepiece: Asha's m as a glass object under a light beam. It tilts toward
 * the cursor (or the phone's tilt), its highlight slides across the glass, and it sits on
 * a soft reflection. All SVG and CSS, no images.
 */
export default function GlassM({ className = "" }: { className?: string }) {
  const id = useId().replace(/:/g, "");
  const wrap = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = wrap.current;
    if (!el || prefersReducedMotion()) return;
    const t0 = performance.now();
    let tx = 0, ty = 0, x = 0, y = 0, raf = 0;
    const onMove = (e: PointerEvent) => {
      const r = el.getBoundingClientRect();
      tx = Math.max(-1, Math.min(1, (e.clientX - (r.left + r.width / 2)) / (window.innerWidth / 2)));
      ty = Math.max(-1, Math.min(1, (e.clientY - (r.top + r.height / 2)) / (window.innerHeight / 2)));
    };
    const onTilt = (e: DeviceOrientationEvent) => {
      if (e.gamma == null || e.beta == null) return;
      tx = Math.max(-1, Math.min(1, e.gamma / 30));
      ty = Math.max(-1, Math.min(1, (e.beta - 45) / 30));
    };
    const tick = (now: number) => {
      const idle = (now - t0) / 1000;
      // ease toward the pointer, plus a slow idle sway so it never sits dead still
      x += (tx + Math.sin(idle * 0.5) * 0.12 - x) * 0.06;
      y += (ty + Math.cos(idle * 0.4) * 0.08 - y) * 0.06;
      el.style.setProperty("--rx", `${(-y * 12).toFixed(2)}deg`);
      el.style.setProperty("--ry", `${(x * 18).toFixed(2)}deg`);
      el.style.setProperty("--hx", `${(50 + x * 38).toFixed(1)}%`);
      el.style.setProperty("--hy", `${(30 + y * 26).toFixed(1)}%`);
      raf = requestAnimationFrame(tick);
    };
    addEventListener("pointermove", onMove, { passive: true });
    addEventListener("deviceorientation", onTilt);
    // start after the page has loaded, so the first paint isn't competing with the loop
    const start = () => (raf = requestAnimationFrame(tick));
    const idle = (window as unknown as { requestIdleCallback?: (cb: () => void, o?: { timeout: number }) => number }).requestIdleCallback;
    const timer = idle ? idle(start, { timeout: 1500 }) : window.setTimeout(start, 600);
    return () => {
      if (idle) (window as unknown as { cancelIdleCallback: (h: number) => void }).cancelIdleCallback(timer);
      else clearTimeout(timer);
      cancelAnimationFrame(raf);
      removeEventListener("pointermove", onMove);
      removeEventListener("deviceorientation", onTilt);
    };
  }, []);

  // positioned by the caller (e.g. "absolute bottom-[28%] …"); relative when used inline
  const position = /\b(absolute|fixed|sticky)\b/.test(className) ? "" : "relative";
  return (
    <div ref={wrap} className={`select-none ${position} ${className}`} aria-hidden style={{ perspective: "1200px" }}>
      {/* beam falling on the m */}
      <div className="pointer-events-none absolute -top-[30%] left-1/2 h-[90%] w-[46%] -translate-x-1/2 rotate-[8deg] bg-[linear-gradient(180deg,transparent,rgba(160,190,255,0.35)_40%,rgba(75,111,245,0.12)_75%,transparent)] blur-2xl" />
      <div
        className="relative mx-auto w-full transition-transform duration-75"
        style={{ transform: "rotateX(var(--rx, 0deg)) rotateY(var(--ry, 0deg))", transformStyle: "preserve-3d" }}
      >
        <svg viewBox="-60 -560 670 562" className="block w-full overflow-visible">
          <defs>
            <linearGradient id={`body${id}`} gradientUnits="userSpaceOnUse" x1="0" y1="-503" x2="0" y2="0">
              <stop offset="0" stopColor="#5b7cff" />
              <stop offset="0.55" stopColor="#3a55e0" />
              <stop offset="1" stopColor="#1b2a8a" />
            </linearGradient>
            <linearGradient id={`rim${id}`} x1="0" y1="0" x2="0" y2="1">
              <stop offset="0" stopColor="#e7efff" stopOpacity="0.95" />
              <stop offset="0.35" stopColor="#9fbaff" stopOpacity="0.55" />
              <stop offset="1" stopColor="#4b6ff5" stopOpacity="0.15" />
            </linearGradient>
            <radialGradient id={`glow${id}`} cx="0.5" cy="0.55" r="0.55">
              <stop offset="0" stopColor="#4b6ff5" stopOpacity="0.55" />
              <stop offset="1" stopColor="#4b6ff5" stopOpacity="0" />
            </radialGradient>
            <filter id={`blur${id}`} x="-20%" y="-20%" width="140%" height="140%">
              <feGaussianBlur stdDeviation="14" />
            </filter>
            <clipPath id={`clip${id}`}>
              <path d={M_PATH} fillRule="evenodd" />
            </clipPath>
            <linearGradient id={`floor${id}`} x1="0" y1="0" x2="0" y2="1">
              <stop offset="0" stopColor="#fff" stopOpacity="0.32" />
              <stop offset="0.6" stopColor="#fff" stopOpacity="0" />
            </linearGradient>
            <mask id={`floorMask${id}`} maskUnits="userSpaceOnUse" x="-60" y="0" width="670" height="300">
              <rect x="-60" y="0" width="670" height="300" fill={`url(#floor${id})`} />
            </mask>
          </defs>

          {/* bloom behind */}
          <ellipse cx="275" cy="-230" rx="330" ry="280" fill={`url(#glow${id})`} />
          {/* body */}
          <path d={M_PATH} fill={`url(#body${id})`} fillRule="evenodd" />
          {/* inner light: a soft bright core that follows the highlight */}
          <g clipPath={`url(#clip${id})`}>
            <foreignObject x="-2" y="-505" width="553" height="507">
              <div
                style={{
                  width: "100%",
                  height: "100%",
                  background:
                    "radial-gradient(38% 30% at var(--hx, 50%) var(--hy, 30%), rgba(235,242,255,0.75), rgba(160,190,255,0.25) 45%, transparent 70%)",
                }}
              />
            </foreignObject>
            {/* depth: the lower half darkens into the floor */}
            <rect x="-2" y="-200" width="553" height="210" fill="#0a1240" opacity="0.35" filter={`url(#blur${id})`} />
          </g>
          {/* glass rim */}
          <path d={M_PATH} fill="none" stroke={`url(#rim${id})`} strokeWidth="3" fillRule="evenodd" />
          {/* the dark pill window, with its own inner rim */}
          <path d={M_WINDOW} fill="#05060a" />
          <path d={M_WINDOW} fill="none" stroke="#9fbaff" strokeOpacity="0.45" strokeWidth="2" />
          {/* floor reflection */}
          <g mask={`url(#floorMask${id})`} opacity="0.55">
            <path d={M_PATH} transform="translate(0 6) scale(1 -1)" fill={`url(#body${id})`} fillRule="evenodd" />
          </g>
        </svg>
      </div>
    </div>
  );
}
