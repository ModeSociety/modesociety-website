"use client";

import { useEffect, useRef, useSyncExternalStore } from "react";
import type { CursorStyle } from "@/lib/slots";

/**
 * Elements opt in with data-cursor="drag" | "flip" | "view" | "open" etc.
 * The label is shown inside the ring when hovering them.
 */
const FINE = "(pointer: fine)";
const subscribeFine = (cb: () => void) => {
  const mq = matchMedia(FINE);
  mq.addEventListener("change", cb);
  return () => mq.removeEventListener("change", cb);
};

export default function Cursor({ style }: { style: CursorStyle }) {
  const ring = useRef<HTMLDivElement>(null);
  const dot = useRef<HTMLDivElement>(null);
  const spot = useRef<HTMLDivElement>(null);
  const fine = useSyncExternalStore(subscribeFine, () => matchMedia(FINE).matches, () => false);
  const enabled = fine && style !== "off";

  useEffect(() => {
    if (!enabled) return;
    const html = document.documentElement;
    if (style === "ring") html.classList.add("has-custom-cursor");
    const target = { x: innerWidth / 2, y: innerHeight / 2 };
    const pos = { ...target };
    let raf = 0;
    let label = "";

    const move = (e: PointerEvent) => {
      target.x = e.clientX;
      target.y = e.clientY;
      if (dot.current) dot.current.style.transform = `translate3d(${e.clientX}px, ${e.clientY}px, 0)`;
      const el = (e.target as HTMLElement | null)?.closest<HTMLElement>("[data-cursor], a, button, [role=button], input, textarea, select, label");
      const next = el?.dataset.cursor ?? (el ? "" : null);
      if (ring.current) {
        ring.current.classList.toggle("active", Boolean(next));
        ring.current.classList.toggle("hover", next === "");
        if (next && next !== label) {
          label = next;
          const span = ring.current.querySelector("span");
          if (span) span.textContent = next;
        }
      }
    };
    const loop = () => {
      pos.x += (target.x - pos.x) * 0.18;
      pos.y += (target.y - pos.y) * 0.18;
      const t = `translate3d(${pos.x}px, ${pos.y}px, 0)`;
      if (ring.current) ring.current.style.transform = t;
      if (spot.current) spot.current.style.transform = t;
      raf = requestAnimationFrame(loop);
    };
    const down = () => ring.current?.animate([{ scale: 1 }, { scale: 0.8 }, { scale: 1 }], { duration: 350 });
    addEventListener("pointermove", move, { passive: true });
    addEventListener("pointerdown", down);
    raf = requestAnimationFrame(loop);
    return () => {
      html.classList.remove("has-custom-cursor");
      removeEventListener("pointermove", move);
      removeEventListener("pointerdown", down);
      cancelAnimationFrame(raf);
    };
  }, [enabled, style]);

  if (!enabled) return null;
  if (style === "spotlight") return <div ref={spot} className="cursor-spot" aria-hidden />;
  return (
    <>
      <div ref={ring} className="cursor-ring" aria-hidden>
        <span />
      </div>
      <div ref={dot} className="cursor-dot" aria-hidden />
    </>
  );
}
