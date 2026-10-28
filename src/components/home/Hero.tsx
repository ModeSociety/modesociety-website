"use client";

import Link from "next/link";
import { useCallback, useEffect, useLayoutEffect, useRef, useState } from "react";
import { HERO_MODES, type HeroMode, type SiteImage, type SiteSettings } from "@/lib/slots";
import { gsap, prefersReducedMotion } from "@/lib/gsap";
import { introDone } from "@/lib/intro";
import { responsive } from "@/lib/img";
import { FitText, Mark } from "@/components/site/Editorial";
import { accent } from "@/components/site/Accent";
import type { SectionCopy } from "@/lib/copy";
import { ENGINES, staticLayout, type EngineCtx } from "./wall/engines";

const LAST_KEY = "ms-hero-last";

const wait = (ms: number) => new Promise<void>((r) => setTimeout(r, ms));

/**
 * Holds the first drop until someone can actually see it: the intro curtain has lifted,
 * the tab is in front (links opened from WhatsApp/Instagram can load in the background)
 * and the first photos have loaded, so empty frames don't fall on slow mobile connections.
 */
async function heroReady(root: HTMLElement) {
  await introDone();
  if (document.hidden) {
    await new Promise<void>((resolve) => {
      const onVis = () => {
        if (document.hidden) return;
        document.removeEventListener("visibilitychange", onVis);
        resolve();
      };
      document.addEventListener("visibilitychange", onVis);
    });
  }
  const imgs = Array.from(root.querySelectorAll("img")).slice(0, 6);
  await Promise.race([Promise.all(imgs.map((img) => img.decode().catch(() => {}))), wait(1800)]);
}

/** The tagline, with the circled word (if it's in there) drawn round in red marker. */
function Tagline({ text, circled }: { text: string; circled: string }) {
  const word = circled.trim();
  // the first time it appears as a whole word
  const escaped = word.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  const at = word ? text.search(new RegExp(`(?<![\\w*])${escaped}(?!\\w)`)) : -1;
  if (at < 0) return <>{accent(text, "italic")}</>;
  return (
    <>
      {accent(text.slice(0, at), "italic")}
      <Mark kind="circle" delay={1.2} className="mx-[0.14em]">
        {word}
      </Mark>
      {accent(text.slice(at + word.length), "italic")}
    </>
  );
}

export default function Hero({ images, settings, text }: { images: SiteImage[]; settings: SiteSettings; text: SectionCopy<"home.hero"> }) {
  const wall = useRef<HTMLDivElement>(null);
  const copy = useRef<HTMLElement>(null);
  // Visitors can't change the mode; it comes from the admin panel.
  const [mode, setMode] = useState<HeroMode>(settings.heroMode);
  const [mobile, setMobile] = useState(false);
  const cards = mobile ? images.slice(0, 6) : images;

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
    // phones: masthead, then copy, then the photos land in the space left at the bottom
    const copyEl = root.parentElement?.querySelector<HTMLElement>("[data-hero-copy]");
    const top = isMobile ? (copyEl ? copyEl.offsetTop + copyEl.offsetHeight + 12 : 70) : 96;
    const bottom = isMobile ? height - 12 : height - 178;
    const ratio = 1.26; // polaroid height / width incl. border (no caption strip)
    const cardW = Math.max(
      86,
      Math.min(isMobile ? 128 : 240, ((width * 0.92) / cols) * (isMobile ? 0.9 : 0.8), ((bottom - top) / rows / ratio) * 1.05),
    );
    els.forEach((el) => el.style.setProperty("--w", `${cardW}px`));
    const ctx: EngineCtx = {
      root,
      cards: els,
      width,
      height,
      cardW,
      cardH: cardW * ratio,
      seed: 7,
      mobile: isMobile,
      top,
      bottom,
    };
    const engine = prefersReducedMotion() ? staticLayout : ENGINES[mode];
    return engine(ctx);
  }, [mode]);

  useEffect(() => {
    let stop = () => {};
    let started = false;
    let cancelled = false;
    heroReady(wall.current!).then(() => {
      if (cancelled) return;
      started = true;
      stop = start();
    });
    let timer: ReturnType<typeof setTimeout>;
    let lastW = window.innerWidth;
    const onResize = () => {
      if (!started || Math.abs(window.innerWidth - lastW) < 40) return; // ignore mobile URL-bar jitter
      lastW = window.innerWidth;
      clearTimeout(timer);
      timer = setTimeout(() => {
        stop();
        stop = start();
      }, 200);
    };
    addEventListener("resize", onResize);
    return () => {
      cancelled = true;
      clearTimeout(timer);
      removeEventListener("resize", onResize);
      stop();
    };
  }, [start, mobile, cards.length]);

  useEffect(() => {
    const el = copy.current;
    if (!el || prefersReducedMotion()) return;
    // hidden until the curtain lifts, then the letters rise as the photos drop
    const tl = gsap.timeline({ paused: true });
    tl.from(el.querySelectorAll(".hero-letter"), { yPercent: 110, duration: 1.3, ease: "expo.out", stagger: 0.04 })
      .from(el.querySelectorAll(".hero-fade"), { y: 16, duration: 1, ease: "expo.out", stagger: 0.08 }, "-=0.9");
    let live = true;
    introDone().then(() => {
      if (live) tl.play();
    });
    return () => {
      live = false;
      tl.revert();
    };
  }, [mobile]); // the masthead splits into two lines on phones, so re-target the letters

  return (
    <section ref={copy} className="relative h-[100svh] min-h-[640px] w-full overflow-hidden" aria-label="Mode Society talent wall">
      {/* cover lines along the top, like a magazine masthead */}
      <div className="hero-fade wrap pointer-events-none absolute inset-x-0 top-[68px] z-20 md:top-[88px]">
        <div className="flex justify-between gap-6 border-t border-espresso/15 pt-2.5 font-mono text-[10.5px] font-medium uppercase tracking-[0.04em] text-muted md:text-[11px]">
          <span>
            <span className="text-ink">(Est. 2022)</span> Talent<span className="hidden sm:inline"> &amp; creator</span> agency
          </span>
          <span className="hidden lg:inline">Models · Influencers · UGC · Streamers</span>
          <span>
            Melbourne → <span className="hidden sm:inline">worldwide</span>
            <span className="sm:hidden">world</span>
          </span>
        </div>
      </div>

      {/* giant masthead behind the wall: one line on desktop, stacked on phones */}
      <div className="pointer-events-none absolute inset-0 flex flex-col">
        <div className="wrap pt-[110px] md:pt-[148px]">
          <h1 className="font-display w-full select-none text-ink">
            <span className="sr-only">Mode Society, boutique talent and creator agency in Melbourne</span>
            {(mobile ? ["MODE", "SOCIETY"] : ["MODE SOCIETY"]).map((line) => (
              <span key={line} aria-hidden className="reveal-line">
                <FitText className="text-[16vw] leading-[0.86]">
                  {line.split("").map((c, i) => (
                    <span key={i} className="hero-letter inline-block whitespace-pre">
                      {c}
                    </span>
                  ))}
                </FitText>
              </span>
            ))}
          </h1>
        </div>

        {/* copy and CTAs: straight under the masthead on phones, a band along the bottom on desktop */}
        <div
          data-hero-copy
          className="pointer-events-none relative z-20 mt-5 md:absolute md:inset-x-0 md:bottom-0 md:mt-0 md:bg-gradient-to-t md:from-paper md:via-paper/85 md:to-transparent md:pt-12"
        >
          <div className="wrap flex flex-col gap-5 md:flex-row md:items-end md:justify-between md:pb-8">
            <div className="pointer-events-auto max-w-lg">
              <p className="hero-fade font-serif text-[23px] leading-[1.12] text-ink md:text-[30px]">
                <Tagline text={text.tagline} circled={text.circled} />
              </p>
              <div className="hero-fade mt-5 flex flex-wrap gap-2">
                {text.brandsButton && (
                  <Link href="/work-with-us" className="btn">
                    {text.brandsButton} <span className="arrow">→</span>
                  </Link>
                )}
                {text.talentButton && (
                  <Link href="/apply-to-be-a-creator" className="btn ghost bg-paper/70 backdrop-blur">
                    {text.talentButton} <span className="arrow">→</span>
                  </Link>
                )}
              </div>
            </div>
            <ol className="hero-fade hidden font-mono text-[11px] font-medium uppercase leading-[1.9] tracking-[0.04em] text-muted md:block md:text-right">
              {text.list.map((l, i) => (
                <li key={`${l}-${i}`}>
                  {l} <span className="text-ink">/{String(i + 1).padStart(2, "0")}</span>
                </li>
              ))}
            </ol>
          </div>
        </div>
      </div>

      <div ref={wall} data-wall className="absolute inset-0 z-10" style={{ transformStyle: "preserve-3d" }}>
        {cards.map((img, i) => (
          <figure key={`${img.src}-${i}`} className="polaroid no-caption" style={{ opacity: 0 }}>
            <span className="pin" />
            <div className="photo">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img {...responsive(img.src, "(max-width: 767px) 128px, 240px", 640)} alt={img.alt} draggable={false} loading={i < 6 ? "eager" : "lazy"} />
            </div>
          </figure>
        ))}
      </div>

    </section>
  );
}
