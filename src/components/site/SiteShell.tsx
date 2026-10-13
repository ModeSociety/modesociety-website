"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";
import Lenis from "lenis";
import { gsap, ScrollTrigger, prefersReducedMotion } from "@/lib/gsap";
import type { SiteSettings } from "@/lib/slots";
import Intro from "./Intro";
import { LogoProvider } from "./Logo";
import Tracker from "./Tracker";

export default function SiteShell({
  settings,
  logoSvg,
  children,
}: {
  settings: SiteSettings;
  logoSvg: string;
  children: React.ReactNode;
}) {
  const pathname = usePathname();

  useEffect(() => {
    if (prefersReducedMotion()) return;
    const lenis = new Lenis({ duration: 1.15, smoothWheel: true });
    lenis.on("scroll", ScrollTrigger.update);
    const tick = (t: number) => lenis.raf(t * 1000);
    gsap.ticker.add(tick);
    gsap.ticker.lagSmoothing(0);
    (window as unknown as { __lenis?: Lenis }).__lenis = lenis;
    return () => {
      gsap.ticker.remove(tick);
      lenis.destroy();
    };
  }, []);

  useEffect(() => {
    // Respect #anchors (e.g. "Apply now" → #apply); otherwise start each page at the top.
    const target = location.hash ? document.getElementById(decodeURIComponent(location.hash.slice(1))) : null;
    if (target) setTimeout(() => target.scrollIntoView({ behavior: "smooth" }), 300);
    else window.scrollTo(0, 0);
    const id = requestAnimationFrame(() => ScrollTrigger.refresh());
    return () => cancelAnimationFrame(id);
  }, [pathname]);

  return (
    <LogoProvider svg={logoSvg}>
      <Intro style={settings.introStyle} />
      <Tracker />
      {children}
    </LogoProvider>
  );
}
