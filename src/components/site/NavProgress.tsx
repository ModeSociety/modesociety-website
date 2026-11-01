"use client";

import { usePathname, useSearchParams } from "next/navigation";
import { useEffect, useRef, useState } from "react";

/**
 * Instant feedback for every click that goes to another page: a thin bar runs along the top
 * the moment the link is pressed and completes when the new page is in. (Most pages arrive at
 * once, as they're prefetched; this covers the ones that take a moment.)
 */
export default function NavProgress({ className = "bg-ink" }: { className?: string }) {
  const pathname = usePathname();
  const search = useSearchParams();
  const [state, setState] = useState<"idle" | "loading" | "done">("idle");
  const timers = useRef<number[]>([]);

  // a link was clicked
  useEffect(() => {
    const onClick = (e: MouseEvent) => {
      if (e.defaultPrevented || e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
      const a = (e.target as Element | null)?.closest?.("a");
      if (!a || !a.href || a.target === "_blank" || a.hasAttribute("download")) return;
      const url = new URL(a.href, location.href);
      if (url.origin !== location.origin || url.pathname.startsWith("/api/")) return;
      if (url.pathname === location.pathname && url.search === location.search) return; // same page (or a #jump)
      timers.current.forEach(clearTimeout);
      setState("loading");
      timers.current = [window.setTimeout(() => setState("idle"), 12000)]; // never stuck
    };
    document.addEventListener("click", onClick, true);
    return () => document.removeEventListener("click", onClick, true);
  }, []);

  // the new page is in
  const [last, setLast] = useState(`${pathname}?${search}`);
  const now = `${pathname}?${search}`;
  if (now !== last) {
    setLast(now);
    if (state === "loading") setState("done");
  }
  useEffect(() => {
    if (state !== "done") return;
    timers.current.forEach(clearTimeout);
    timers.current = [window.setTimeout(() => setState("idle"), 400)];
  }, [state]);

  useEffect(() => {
    document.documentElement.classList.toggle("is-navigating", state === "loading");
  }, [state]);

  return (
    <div aria-hidden className="pointer-events-none fixed inset-x-0 top-0 z-[400] h-[3px]">
      <div
        className={`h-full origin-left ${className}`}
        style={{
          transform: `scaleX(${state === "idle" ? 0 : state === "loading" ? 0.85 : 1})`,
          opacity: state === "idle" ? 0 : 1,
          transition:
            state === "loading"
              ? "transform 8s cubic-bezier(.05,.75,.15,1), opacity .1s"
              : state === "done"
                ? "transform .2s ease-out, opacity .3s .2s"
                : "none",
        }}
      />
    </div>
  );
}
