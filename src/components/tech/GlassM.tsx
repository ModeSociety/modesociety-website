"use client";

import { useEffect, useId, useRef } from "react";
import { prefersReducedMotion } from "@/lib/gsap";
import { M_PATH, M_WINDOW } from "./mark-paths";

const LAYERS = 14; // slices that give the m its thickness

/**
 * Asha's m as a thick glass object: a lit front face over a stack of slices, so it has real
 * depth when it turns. It leans toward the cursor (or the phone's tilt), and can be grabbed
 * and spun; a fling keeps spinning and settles face-on. A tap gives it a full turn.
 */
export default function GlassM({ className = "" }: { className?: string }) {
  const id = useId().replace(/:/g, "");
  const wrap = useRef<HTMLDivElement>(null);
  const rig = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = wrap.current;
    const r = rig.current;
    if (!el || !r) return;
    const setDepth = () => el.style.setProperty("--slice", `${(el.clientWidth * 0.13) / LAYERS}px`);
    setDepth();
    const ro = new ResizeObserver(setDepth);
    ro.observe(el);
    if (prefersReducedMotion()) return () => ro.disconnect();

    const t0 = performance.now();
    let tx = 0, ty = 0, x = 0, y = 0, raf = 0;
    let spin = 0, vel = 0, drag: null | { x: number; last: number; t: number; moved: number; id: number } = null;

    const onMove = (e: PointerEvent) => {
      if (drag && e.pointerId === drag.id) {
        const now = performance.now();
        const dx = e.clientX - drag.last;
        drag.moved += Math.abs(dx);
        spin += dx * 0.55;
        vel = (dx * 0.55) / Math.max(now - drag.t, 8) * 16; // degrees per frame
        drag.last = e.clientX;
        drag.t = now;
        return;
      }
      const b = el.getBoundingClientRect();
      tx = Math.max(-1, Math.min(1, (e.clientX - (b.left + b.width / 2)) / (window.innerWidth / 2)));
      ty = Math.max(-1, Math.min(1, (e.clientY - (b.top + b.height / 2)) / (window.innerHeight / 2)));
    };
    const onDown = (e: PointerEvent) => {
      drag = { x: e.clientX, last: e.clientX, t: performance.now(), moved: 0, id: e.pointerId };
      vel = 0;
      el.setPointerCapture(e.pointerId);
      el.style.cursor = "grabbing";
    };
    const onUp = (e: PointerEvent) => {
      if (!drag || e.pointerId !== drag.id) return;
      if (drag.moved < 6) vel = 22; // a tap: one full turn
      drag = null;
      el.style.cursor = "";
    };
    const onTilt = (e: DeviceOrientationEvent) => {
      if (e.gamma == null || e.beta == null) return;
      tx = Math.max(-1, Math.min(1, e.gamma / 30));
      ty = Math.max(-1, Math.min(1, (e.beta - 45) / 30));
    };

    const tick = (now: number) => {
      const idle = (now - t0) / 1000;
      x += (tx + Math.sin(idle * 0.5) * 0.14 - x) * 0.06;
      y += (ty + Math.cos(idle * 0.4) * 0.08 - y) * 0.06;
      if (!drag) {
        spin += vel;
        vel *= 0.955;
        if (Math.abs(vel) < 0.6) {
          // settle on the nearest face-on turn
          const target = Math.round(spin / 360) * 360;
          spin += (target - spin) * 0.08;
          vel = 0;
        }
      }
      r.style.transform = `rotateX(${(-y * 14).toFixed(2)}deg) rotateY(${(x * 24 + spin).toFixed(2)}deg)`;
      el.style.setProperty("--hx", `${(50 + x * 38).toFixed(1)}%`);
      el.style.setProperty("--hy", `${(30 + y * 26).toFixed(1)}%`);
      raf = requestAnimationFrame(tick);
    };

    addEventListener("pointermove", onMove, { passive: true });
    el.addEventListener("pointerdown", onDown);
    addEventListener("pointerup", onUp);
    addEventListener("pointercancel", onUp);
    addEventListener("deviceorientation", onTilt);
    // start once the page is idle, so first paint isn't competing with the loop
    const start = () => (raf = requestAnimationFrame(tick));
    const ric = (window as unknown as { requestIdleCallback?: (cb: () => void, o?: { timeout: number }) => number }).requestIdleCallback;
    const handle = ric ? ric(start, { timeout: 1500 }) : window.setTimeout(start, 600);
    return () => {
      if (ric) (window as unknown as { cancelIdleCallback: (h: number) => void }).cancelIdleCallback(handle);
      else clearTimeout(handle);
      cancelAnimationFrame(raf);
      ro.disconnect();
      removeEventListener("pointermove", onMove);
      el.removeEventListener("pointerdown", onDown);
      removeEventListener("pointerup", onUp);
      removeEventListener("pointercancel", onUp);
      removeEventListener("deviceorientation", onTilt);
    };
  }, []);

  // positioned by the caller (e.g. "absolute bottom-[28%] …"); relative when used inline
  const position = /\b(absolute|fixed|sticky)\b/.test(className) ? "" : "relative";
  const svgBox = "-2 -505 553 507";
  return (
    <div
      ref={wrap}
      className={`cursor-grab touch-pan-y select-none ${position} ${className}`}
      style={{ perspective: "1400px", aspectRatio: "553 / 507" }}
      aria-hidden
    >
      {/* bloom behind */}
      <div className="pointer-events-none absolute -inset-[18%] rounded-full bg-[radial-gradient(closest-side,rgba(110,140,255,0.42),rgba(170,150,255,0.14)_60%,transparent)] blur-2xl" />
      <div ref={rig} className="absolute inset-0" style={{ transformStyle: "preserve-3d" }}>
        {/* the slices: deep blue at the back, lighter toward the face */}
        {Array.from({ length: LAYERS }).map((_, i) => (
          <svg
            key={i}
            viewBox={svgBox}
            className="absolute inset-0 h-full w-full"
            style={{ transform: `translateZ(calc(var(--slice, 4px) * ${-(i + 1)}))` }}
          >
            <path d={M_PATH} fillRule="evenodd" fill={`rgb(${28 + (LAYERS - i) * 3}, ${44 + (LAYERS - i) * 5}, ${150 + (LAYERS - i) * 6})`} />
          </svg>
        ))}
        {/* back face, so a spin shows the m the right way round */}
        <svg viewBox={svgBox} className="absolute inset-0 h-full w-full" style={{ transform: `translateZ(calc(var(--slice, 4px) * ${-(LAYERS + 1)})) rotateY(180deg)` }}>
          <path d={M_PATH} fillRule="evenodd" fill="#2a40b8" transform="translate(551 0) scale(-1 1)" />
        </svg>
        {/* the lit glass face */}
        <svg viewBox={svgBox} className="absolute inset-0 h-full w-full overflow-visible">
          <defs>
            <linearGradient id={`body${id}`} gradientUnits="userSpaceOnUse" x1="0" y1="-503" x2="0" y2="0">
              <stop offset="0" stopColor="#6b88ff" />
              <stop offset="0.55" stopColor="#3f5ae6" />
              <stop offset="1" stopColor="#2337a8" />
            </linearGradient>
            <linearGradient id={`rim${id}`} x1="0" y1="0" x2="0" y2="1">
              <stop offset="0" stopColor="#eef3ff" stopOpacity="0.95" />
              <stop offset="0.4" stopColor="#a9c2ff" stopOpacity="0.55" />
              <stop offset="1" stopColor="#4b6ff5" stopOpacity="0.2" />
            </linearGradient>
            <clipPath id={`clip${id}`}>
              <path d={M_PATH} fillRule="evenodd" />
            </clipPath>
          </defs>
          <path d={M_PATH} fill={`url(#body${id})`} fillRule="evenodd" />
          <g clipPath={`url(#clip${id})`}>
            <foreignObject x="-2" y="-505" width="553" height="507">
              <div
                style={{
                  width: "100%",
                  height: "100%",
                  background:
                    "radial-gradient(36% 28% at var(--hx, 50%) var(--hy, 30%), rgba(240,245,255,0.8), rgba(170,195,255,0.25) 45%, transparent 70%), linear-gradient(115deg, transparent 40%, rgba(255,255,255,0.14) 48%, transparent 56%)",
                }}
              />
            </foreignObject>
          </g>
          <path d={M_PATH} fill="none" stroke={`url(#rim${id})`} strokeWidth="3" fillRule="evenodd" />
          <path d={M_WINDOW} fill="none" stroke="#c3d4ff" strokeOpacity="0.6" strokeWidth="2.5" />
        </svg>
      </div>
      {/* floor reflection */}
      <svg viewBox={svgBox} preserveAspectRatio="xMidYMin slice" className="pointer-events-none absolute left-0 top-full h-[45%] w-full opacity-30 [mask-image:linear-gradient(180deg,rgba(0,0,0,0.8),transparent)]" style={{ transform: "scaleY(-1)", transformOrigin: "50% 0" }}>
        <path d={M_PATH} fillRule="evenodd" fill="#3f5ae6" />
      </svg>
    </div>
  );
}
