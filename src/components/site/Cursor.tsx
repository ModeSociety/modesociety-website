"use client";

import { useEffect, useRef, useSyncExternalStore } from "react";
import type { CursorStyle } from "@/lib/slots";
import Logo from "./Logo";

const FINE = "(pointer: fine)";
const subscribeFine = (cb: () => void) => {
  const mq = matchMedia(FINE);
  mq.addEventListener("change", cb);
  return () => mq.removeEventListener("change", cb);
};

/**
 * Elements opt in with data-cursor="drag" | "flip" | "view" | "open" etc.
 * The label is shown inside the ring when hovering them.
 *
 * Each visual sits inside a wrapper that only carries the translate; sizing and the
 * click "press" happen on the inner element, centred with translate(-50%, -50%),
 * so they can never shift the cursor's position.
 */
export default function Cursor({ style }: { style: CursorStyle }) {
  const ringPos = useRef<HTMLDivElement>(null);
  const ring = useRef<HTMLDivElement>(null);
  const dotPos = useRef<HTMLDivElement>(null);
  const spot = useRef<HTMLDivElement>(null);
  const logoPos = useRef<HTMLDivElement>(null);
  const logoTag = useRef<HTMLSpanElement>(null);
  const fine = useSyncExternalStore(subscribeFine, () => matchMedia(FINE).matches, () => false);
  const enabled = fine && style !== "off";

  useEffect(() => {
    if (!enabled) return;
    const html = document.documentElement;
    if (style === "ring" || style === "logo") html.classList.add("has-custom-cursor");
    const target = { x: innerWidth / 2, y: innerHeight / 2 };
    const pos = { ...target };
    let raf = 0;
    let label = "";

    const move = (e: PointerEvent) => {
      target.x = e.clientX;
      target.y = e.clientY;
      const at = `translate3d(${e.clientX}px, ${e.clientY}px, 0)`;
      if (dotPos.current) dotPos.current.style.transform = at;
      if (logoPos.current) {
        logoPos.current.style.transform = at;
        logoPos.current.classList.add("live");
      }
      const el = (e.target as HTMLElement | null)?.closest<HTMLElement>(
        "[data-cursor], a, button, [role=button], input, textarea, select, label",
      );
      const next = el?.dataset.cursor ?? (el ? "" : null);
      if (logoTag.current) {
        logoTag.current.textContent = next || "";
        logoTag.current.classList.toggle("show", Boolean(next));
        logoPos.current?.classList.toggle("hover", next !== null);
      }
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
      if (ringPos.current) ringPos.current.style.transform = t;
      if (spot.current) spot.current.style.transform = t;
      raf = requestAnimationFrame(loop);
    };
    const down = () => {
      ring.current?.classList.add("pressed");
      logoPos.current?.classList.add("pressed");
    };
    const up = () => {
      ring.current?.classList.remove("pressed");
      logoPos.current?.classList.remove("pressed");
    };
    addEventListener("pointermove", move, { passive: true });
    addEventListener("pointerdown", down);
    addEventListener("pointerup", up);
    addEventListener("pointercancel", up);
    raf = requestAnimationFrame(loop);
    return () => {
      html.classList.remove("has-custom-cursor");
      removeEventListener("pointermove", move);
      removeEventListener("pointerdown", down);
      removeEventListener("pointerup", up);
      removeEventListener("pointercancel", up);
      cancelAnimationFrame(raf);
    };
  }, [enabled, style]);

  if (!enabled) return null;
  if (style === "logo") {
    return (
      <div ref={logoPos} className="cursor-pos cursor-logo" aria-hidden>
        <span className="cursor-logo-mark">
          <Logo compact className="h-full" />
        </span>
        <span ref={logoTag} className="cursor-logo-tag" />
      </div>
    );
  }
  if (style === "spotlight") return <div ref={spot} className="cursor-spot" aria-hidden />;
  return (
    <>
      <div ref={ringPos} className="cursor-pos" aria-hidden>
        <div ref={ring} className="cursor-ring">
          <span />
        </div>
      </div>
      <div ref={dotPos} className="cursor-pos" aria-hidden>
        <div className="cursor-dot" />
      </div>
    </>
  );
}
