"use client";

import { useEffect } from "react";

/**
 * Makes a horizontal overflow strip swipeable with a mouse (touch already scrolls natively):
 * drag to move, flick for momentum, then it settles on the nearest card ([data-card]).
 * Also turns vertical-dominant trackpad swipes that start horizontally into strip scrolling.
 */
export function useDragScroll(ref: React.RefObject<HTMLElement | null>) {
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    let drag: null | { x: number; left: number; lastX: number; lastT: number; v: number; moved: number; id: number } = null;
    let raf = 0;
    let wheelIdle: ReturnType<typeof setTimeout> | undefined;

    const snap = () => {
      const cards = Array.from(el.querySelectorAll<HTMLElement>("[data-card]"));
      if (!cards.length) return;
      const pad = parseFloat(getComputedStyle(el).paddingLeft) || 0;
      const target = cards.reduce((best, c) =>
        Math.abs(c.offsetLeft - pad - el.scrollLeft) < Math.abs(best.offsetLeft - pad - el.scrollLeft) ? c : best,
      );
      el.scrollTo({ left: target.offsetLeft - pad, behavior: "smooth" });
    };

    const glide = (v: number) => {
      cancelAnimationFrame(raf);
      const step = () => {
        v *= 0.92;
        el.scrollLeft -= v;
        if (Math.abs(v) > 0.6) raf = requestAnimationFrame(step);
        else {
          el.style.scrollSnapType = "";
          snap();
        }
      };
      raf = requestAnimationFrame(step);
    };

    const down = (e: PointerEvent) => {
      if (e.pointerType !== "mouse" || e.button !== 0) return;
      cancelAnimationFrame(raf);
      drag = { x: e.clientX, left: el.scrollLeft, lastX: e.clientX, lastT: performance.now(), v: 0, moved: 0, id: e.pointerId };
      el.style.scrollSnapType = "none"; // snapping fights a live drag
      el.style.cursor = "grabbing";
    };
    const move = (e: PointerEvent) => {
      if (!drag || drag.id !== e.pointerId) return;
      const now = performance.now();
      const dx = e.clientX - drag.lastX;
      drag.v = drag.v * 0.6 + (dx / Math.max(now - drag.lastT, 1)) * 16 * 0.4;
      drag.lastX = e.clientX;
      drag.lastT = now;
      drag.moved += Math.abs(dx);
      if (drag.moved > 4 && !el.hasPointerCapture(e.pointerId)) el.setPointerCapture(e.pointerId);
      el.scrollLeft = drag.left - (e.clientX - drag.x);
    };
    const up = (e: PointerEvent) => {
      if (!drag || drag.id !== e.pointerId) return;
      const { v, moved } = drag;
      drag = null;
      el.style.cursor = "";
      if (moved > 4) {
        // swallow the click that follows a drag so links/buttons inside don't fire
        el.addEventListener("click", (c) => (c.preventDefault(), c.stopPropagation()), { capture: true, once: true });
      }
      glide(v);
    };
    const wheel = (e: WheelEvent) => {
      // horizontal trackpad swipes: scroll the strip ourselves so the page's smooth-scroll doesn't eat them
      if (Math.abs(e.deltaX) > Math.abs(e.deltaY)) {
        e.preventDefault();
        e.stopPropagation();
        cancelAnimationFrame(raf);
        el.style.scrollSnapType = "none"; // otherwise each small step snaps straight back
        el.scrollLeft += e.deltaX;
        clearTimeout(wheelIdle);
        wheelIdle = setTimeout(() => {
          el.style.scrollSnapType = "";
          snap();
        }, 160);
      }
    };

    el.addEventListener("pointerdown", down);
    el.addEventListener("pointermove", move);
    el.addEventListener("pointerup", up);
    el.addEventListener("pointercancel", up);
    el.addEventListener("wheel", wheel, { passive: false });
    el.addEventListener("dragstart", (e) => e.preventDefault());
    return () => {
      cancelAnimationFrame(raf);
      clearTimeout(wheelIdle);
      el.removeEventListener("pointerdown", down);
      el.removeEventListener("pointermove", move);
      el.removeEventListener("pointerup", up);
      el.removeEventListener("pointercancel", up);
      el.removeEventListener("wheel", wheel);
    };
  }, [ref]);
}
