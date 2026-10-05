"use client";

import Link from "next/link";
import { useCallback, useEffect, useLayoutEffect, useRef, useState } from "react";
import { HERO_MODES, type HeroMode, type SiteImage, type SiteSettings } from "@/lib/slots";
import { gsap, prefersReducedMotion } from "@/lib/gsap";
import Logo from "@/components/site/Logo";
import { ENGINES, staticLayout, type EngineCtx } from "./wall/engines";

const HINTS: Record<HeroMode, string> = {
  pinboard: "Drag to rearrange · double-click to unpin",
  scatter: "Move through the crowd",
  orbit: "Drag to spin · click to bring forward",
  gravity: "Hover a polaroid to drop them all",
};

const LAST_KEY = "ms-hero-last";

export default function Hero({ images, settings }: { images: SiteImage[]; settings: SiteSettings }) {
  const wall = useRef<HTMLDivElement>(null);
  const copy = useRef<HTMLDivElement>(null);
  const logo = useRef<HTMLDivElement>(null);
  // Visitors can't change the mode; it comes from the admin panel.
  const [mode, setMode] = useState<HeroMode>(settings.heroMode);
  const [seed, setSeed] = useState(7);
  const [mobile, setMobile] = useState(false);
  const [dropped, setDropped] = useState(false);
  const cards = images.slice(0, mobile ? 6 : 8);

  // Rotate: each visit gets a random mode, never the same one twice in a row.
  useEffect(() => {
    if (!settings.heroAutoCycle) return;
    let last: string | null = null;
    try {
      last = localStorage.getItem(LAST_KEY);
    } catch {
      /* storage blocked — still pick at random */
    }
    const options = HERO_MODES.map((m) => m.id).filter((id) => id !== last);
    const next = options[Math.floor(Math.random() * options.length)];
    try {
      localStorage.setItem(LAST_KEY, next);
    } catch {
      /* ignore */
    }
    // eslint-disable-next-line react-hooks/set-state-in-effect -- random pick must happen client-side
    setMode(next);
  }, [settings.heroAutoCycle]);

  useLayoutEffect(() => {
    const check = () => setMobile(window.innerWidth < 768);
    check();
    addEventListener("resize", check);
    return () => removeEventListener("resize", check);
  }, []);

  const start = useCallback(() => {
    const root = wall.current;
    if (!root) return () => {};
    const els = Array.from(root.querySelectorAll<HTMLElement>(".polaroid"));
    if (!els.length) return () => {};
    const width = root.clientWidth;
    const height = root.clientHeight;
    const n = els.length;
    const isMobile = width < 768;
    const rows = isMobile ? Math.ceil(n / 3) : n > 12 ? 3 : 2;
    const cols = Math.ceil(n / rows);
    const top = isMobile ? 70 : 96;
    const bottom = height - (isMobile ? 262 : 178);
    const ratio = 1.27; // polaroid height / width incl. border (no caption strip)
    const lane = !isMobile && logo.current ? logo.current.offsetWidth * 0.82 : 0;
    const cardW = Math.max(
      86,
      Math.min(isMobile ? 150 : 240, ((width * 0.92 - lane) / cols) * (isMobile ? 0.9 : 0.86), ((bottom - top) / rows / ratio) * 1.05),
    );
    els.forEach((el) => el.style.setProperty("--w", `${cardW}px`));
    const ctx: EngineCtx = {
      root,
      cards: els,
      width,
      height,
      cardW,
      cardH: cardW * ratio,
      seed,
      mobile: isMobile,
      top,
      bottom,
      dropZone: logo.current,
    };
    const engine = prefersReducedMotion() ? staticLayout : ENGINES[mode];
    return engine(ctx);
  }, [mode, seed]);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- a fresh wall starts pinned
    setDropped(false);
    const root = wall.current;
    const onDrop = () => setDropped(true);
    root?.addEventListener("ms-drop", onDrop);
    let stop = start();
    let timer: ReturnType<typeof setTimeout>;
    let lastW = window.innerWidth;
    const onResize = () => {
      if (Math.abs(window.innerWidth - lastW) < 40) return; // ignore mobile URL-bar jitter
      lastW = window.innerWidth;
      clearTimeout(timer);
      timer = setTimeout(() => {
        stop();
        stop = start();
      }, 200);
    };
    addEventListener("resize", onResize);
    return () => {
      clearTimeout(timer);
      removeEventListener("resize", onResize);
      root?.removeEventListener("ms-drop", onDrop);
      stop();
    };
  }, [start, mobile, cards.length]);

  useEffect(() => {
    if (!copy.current || prefersReducedMotion()) return;
    const tl = gsap.timeline({ delay: 0.3 });
    tl.from(copy.current.querySelectorAll(".hero-logo"), { yPercent: 18, opacity: 0, duration: 1.4, ease: "expo.out" })
      .from(copy.current.querySelectorAll(".hero-fade"), { opacity: 0, y: 16, duration: 1, ease: "expo.out", stagger: 0.08 }, "-=0.9");
    return () => {
      tl.revert();
    };
  }, []);

  return (
    <section className="relative h-[100svh] min-h-[640px] w-full overflow-hidden text-ink" aria-label="Mode Society">
      <div ref={copy} className="absolute inset-0">
        {/* the logo, centre stage, framed by the polaroids; hovering (or tapping) it drops them in gravity mode */}
        <div className="absolute inset-x-0 top-[44%] flex -translate-y-1/2 justify-center md:top-[43%]">
          <div ref={logo} onPointerDown={() => wall.current?.dispatchEvent(new CustomEvent("ms-drop-request"))}>
            <h1 className="hero-logo select-none">
              <span className="sr-only">Mode Society — not your average talent agency</span>
              <Logo className="h-[min(26vw,34svh)] [&>svg]:max-w-[86vw]" />
            </h1>
          </div>
        </div>
      </div>

      <div ref={wall} data-wall className="absolute inset-0 z-10" style={{ transformStyle: "preserve-3d", pointerEvents: "none" }}>
        {cards.map((img, i) => (
          <figure key={`${img.src}-${i}`} className="polaroid no-caption" style={{ opacity: 0, pointerEvents: "auto" }}>
            <span className="pin" />
            <div className="photo">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={img.src} alt={img.alt} draggable={false} loading={i < 6 ? "eager" : "lazy"} />
            </div>
          </figure>
        ))}
      </div>

      <div className="pointer-events-none absolute inset-x-0 bottom-0 z-20 bg-gradient-to-t from-paper via-paper/85 to-transparent pt-10">
        <div className="wrap flex flex-col gap-5 pb-6 md:flex-row md:items-end md:justify-between md:pb-8">
          <div className="pointer-events-auto max-w-md">
            <p className="hero-fade eyebrow hidden md:block">Boutique talent &amp; creator agency · Melbourne → worldwide</p>
            <p className="hero-fade font-serif text-[22px] leading-[1.15] md:mt-2 md:text-[28px]">
              <em>Influencers, UGC creators, models &amp; streamers,</em> cast for fit, not follower count.
            </p>
            <div className="hero-fade mt-4 flex flex-wrap gap-2">
              <Link href="/work-with-us" className="btn">
                For brands <span className="arrow">→</span>
              </Link>
              <Link href="/apply-to-be-a-creator" className="btn ghost bg-paper/70 backdrop-blur">
                For talent <span className="arrow">→</span>
              </Link>
            </div>
          </div>
          <div className="hero-fade pointer-events-auto flex flex-col items-start gap-2 md:items-end">
            <span className="font-serif text-sm italic text-ink-2">{dropped && mode === "gravity" ? "Grab them and throw them" : HINTS[mode]}</span>
            <button
              onClick={() => setSeed((s) => s + 1)}
              className="group flex items-center gap-2 rounded-full border border-line bg-paper/80 px-4 py-2 text-[11px] uppercase tracking-[0.14em] text-ink-2 backdrop-blur-md transition-colors hover:text-ink"
              aria-label={mode === "gravity" ? "Pin the polaroids back up" : "Shuffle the wall"}
            >
              <span className="inline-block transition-transform duration-500 group-hover:rotate-180">⟲</span>{" "}
              {mode === "gravity" ? "Pin them back" : "Shuffle"}
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}
