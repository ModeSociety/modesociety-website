"use client";

import { useEffect, useRef } from "react";

/** A muted looping clip that only downloads and plays while it's on (or near) the screen. */
export default function LazyVideo({ src, label, className = "" }: { src: string; label: string; className?: string }) {
  const ref = useRef<HTMLVideoElement>(null);
  useEffect(() => {
    const v = ref.current;
    if (!v) return;
    const io = new IntersectionObserver(
      ([e]) => {
        if (e.isIntersecting) v.play().catch(() => {});
        else v.pause();
      },
      { rootMargin: "200px 0px" },
    );
    io.observe(v);
    return () => io.disconnect();
  }, []);
  return <video ref={ref} src={src} muted loop playsInline preload="none" aria-label={label} className={className} />;
}
