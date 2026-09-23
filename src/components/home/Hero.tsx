"use client";

import Link from "next/link";
import { useCallback, useEffect, useLayoutEffect, useRef, useState } from "react";
import { HERO_MODES, type HeroMode, type SiteImage, type SiteSettings } from "@/lib/slots";
import { gsap, prefersReducedMotion } from "@/lib/gsap";
import { ENGINES, staticLayout, type EngineCtx } from "./wall/engines";

const HINTS: Record<HeroMode, string> = {
  pinboard: "Drag to rearrange · double-click to unpin",
  scatter: "Move through the crowd",
  orbit: "Drag to spin · click to bring forward",
  gravity: "Grab, throw, stack",
};

const CYCLE_KEY = "ms-hero-cycle";

export default function Hero({ images, settings }: { images: SiteImage[]; settings: SiteSettings }) {
  const wall = useRef<HTMLDivElement>(null);
  const copy = useRef<HTMLDivElement>(null);
  const [mode, setMode] = useState<HeroMode>(settings.heroMode);
  const [seed, setSeed] = useState(7);
  const [mobile, setMobile] = useState(false);
  const cards = mobile ? images.slice(0, 6) : images;

  // Auto-cycle: each visit starts on the next mode in the rotation.
  useEffect(() => {
    if (!settings.heroAutoCycle) return;
    try {
      const ids = HERO_MODES.map((m) => m.id);
      const next = (Number(localStorage.getItem(CYCLE_KEY) ?? ids.indexOf(settings.heroMode) - 1) + 1) % ids.length;
      localStorage.setItem(CYCLE_KEY, String(next));
      // eslint-disable-next-line react-hooks/set-state-in-effect -- visit counter lives in localStorage
      setMode(ids[next]);
    } catch {
      /* ignore */
    }
  }, [settings.heroAutoCycle, settings.heroMode]);

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
    const ratio = 1.36; // polaroid height / width incl. border
    const cardW = Math.max(
      86,
      Math.min(isMobile ? 150 : 240, ((width * 0.92) / cols) * (isMobile ? 0.9 : 0.8), ((bottom - top) / rows / ratio) * 1.05),
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
    };
    const engine = prefersReducedMotion() ? staticLayout : ENGINES[mode];
    return engine(ctx);
  }, [mode, seed]);

  useEffect(() => {
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
      stop();
    };
  }, [start, mobile, cards.length]);

  useEffect(() => {
    if (!copy.current || prefersReducedMotion()) return;
    const tl = gsap.timeline({ delay: 0.3 });
    tl.from(copy.current.querySelectorAll(".hero-letter"), { yPercent: 110, duration: 1.3, ease: "expo.out", stagger: 0.04 })
      .from(copy.current.querySelectorAll(".hero-fade"), { opacity: 0, y: 16, duration: 1, ease: "expo.out", stagger: 0.08 }, "-=0.9");
    return () => {
      tl.kill();
    };
  }, []);

  return (
    <section className="relative h-[100svh] min-h-[640px] w-full overflow-hidden" aria-label="Mode Society talent wall">
      {/* giant wordmark behind the wall */}
      <div ref={copy} className="pointer-events-none absolute inset-0 flex flex-col">
        <div className="flex flex-1 items-center justify-center">
          <h1 className="font-display select-none overflow-hidden text-center text-[15vw] leading-[1.15] text-ink/[0.9] md:text-[12.5vw]">
            <span className="sr-only">Mode Society</span>
            <span aria-hidden className="block overflow-hidden">
              {"MODE".split("").map((c, i) => (
                <span key={i} className="hero-letter inline-block">{c}</span>
              ))}
            </span>
            <span aria-hidden className="block overflow-hidden">
              {"SOCIETY".split("").map((c, i) => (
                <span key={i} className="hero-letter inline-block">{c}</span>
              ))}
            </span>
          </h1>
        </div>
      </div>

      <div ref={wall} data-wall className="absolute inset-0 z-10" style={{ transformStyle: "preserve-3d" }}>
        {cards.map((img, i) => (
          <figure key={`${img.src}-${i}`} className="polaroid" style={{ opacity: 0 }}>
            <span className="pin" />
            <div className="photo">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={img.src} alt={img.alt} draggable={false} loading={i < 6 ? "eager" : "lazy"} />
            </div>
            <figcaption className="caption">
              <span>No. {String(i + 1).padStart(2, "0")}</span>
              <span className="opacity-60">MS</span>
            </figcaption>
          </figure>
        ))}
      </div>

      {/* bottom band: copy, CTAs and the mode dock */}
      <div className="pointer-events-none absolute inset-x-0 bottom-0 z-20 bg-gradient-to-t from-paper via-paper/80 to-transparent pt-10">
        <div className="wrap flex flex-col gap-5 pb-6 md:flex-row md:items-end md:justify-between md:pb-8">
          <div className="pointer-events-auto max-w-md">
            <p className="hero-fade eyebrow hidden md:block">Boutique talent &amp; creator agency · Australia → worldwide</p>
            <p className="hero-fade font-serif text-[22px] md:mt-2 leading-[1.15] md:text-[28px]">
              <em>Models, influencers, UGC creators &amp; streamers,</em> cast for fit, not follower count.
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
            <span className="font-serif text-sm italic text-ink-2">{HINTS[mode]}</span>
            <div className="flex items-center gap-1 rounded-full border border-line bg-paper/80 p-1 backdrop-blur-md">
              {HERO_MODES.map((m) => (
                <button
                  key={m.id}
                  onClick={() => setMode(m.id)}
                  aria-pressed={mode === m.id}
                  title={m.description}
                  className={`rounded-full px-3 py-2 text-[11px] uppercase tracking-[0.14em] transition-colors duration-300 ${
                    mode === m.id ? "bg-ink text-paper" : "text-ink-2 hover:text-ink"
                  }`}
                >
                  {m.label.replace("Parallax ", "").replace(" Drop", "")}
                </button>
              ))}
              <button
                onClick={() => setSeed((s) => s + 1)}
                className="grid h-8 w-8 place-items-center rounded-full text-ink-2 transition-transform duration-500 hover:rotate-180 hover:text-ink"
                aria-label="Shuffle the wall"
                title="Shuffle"
              >
                ⟲
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
