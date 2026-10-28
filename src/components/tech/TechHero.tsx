"use client";

import Link from "next/link";
import { useRef } from "react";
import Marquee from "@/components/site/Marquee";
import { gsap, prefersReducedMotion, useGSAP } from "@/lib/gsap";
import { introDone } from "@/lib/intro";
import { TECH_CATEGORIES, TECH_FORMATS } from "@/lib/tech";
import Decode from "./Decode";
import GlassM from "./GlassM";
import GridFloor from "./GridFloor";

/** Corner brackets, like a game HUD frame. */
function Brackets() {
  const c = "absolute h-5 w-5 border-tblue/40";
  return (
    <div aria-hidden className="pointer-events-none absolute inset-4 md:inset-6">
      <span className={`${c} left-0 top-0 border-l border-t`} />
      <span className={`${c} right-0 top-0 border-r border-t`} />
      <span className={`${c} bottom-0 left-0 border-b border-l`} />
      <span className={`${c} bottom-0 right-0 border-b border-r`} />
    </div>
  );
}

/**
 * The Tech hero: an arena (perspective grid floor to a horizon, stars above) with the
 * thick glass m standing on the horizon, a decoding headline, HUD readouts, the two
 * front doors, and a broadcast ticker along the bottom.
 */
export default function TechHero({ landing = false }: { landing?: boolean }) {
  const ref = useRef<HTMLElement>(null);
  useGSAP(
    () => {
      if (prefersReducedMotion()) return;
      // plays as the boot screen (first visit) wipes away
      const tl = gsap.timeline({ paused: true, delay: 0.1 });
      tl
        .from(".h-letter", { yPercent: 110, duration: 1.1, ease: "expo.out", stagger: 0.03 })
        .from(".h-fade", { y: 18, duration: 0.9, ease: "expo.out", stagger: 0.08 }, "-=0.8")
        .from(".h-arena", { opacity: 0, duration: 1.6, ease: "power2.out" }, 0)
        .from(".h-m", { y: 60, opacity: 0, duration: 1.6, ease: "expo.out" }, 0.3);
      let live = true;
      introDone().then(() => {
        if (live) tl.play();
      });
      return () => {
        live = false;
      };
    },
    { scope: ref },
  );

  const line = (text: string) => (
    <span className="block overflow-hidden pb-[0.06em]">
      {text.split(" ").map((word, w, all) => (
        <span key={w} className="inline-block whitespace-nowrap">
          {word.split("").map((c, i) => (
            <span key={i} className="h-letter inline-block">
              {c}
            </span>
          ))}
          {w < all.length - 1 && <span className="inline-block">&nbsp;</span>}
        </span>
      ))}
    </span>
  );

  const ticker = ["Now casting", ...TECH_CATEGORIES.map((c) => c.title), ...TECH_FORMATS.map((f) => f.title)];

  return (
    <section ref={ref} className="relative overflow-hidden">
      {/* phones: headline, arena, doors · from lg: the arena fills the hero, headline top-left, doors bottom-left */}
      <div className="relative flex flex-col lg:min-h-[max(720px,100svh)] lg:justify-between">
        {/* the arena: its own block on phones, the full hero behind everything from lg */}
        <div className="h-arena relative order-2 aspect-[4/3.6] sm:aspect-[16/10] lg:absolute lg:inset-0 lg:aspect-auto">
          <GridFloor horizon={0.62} />
          <div aria-hidden className="t-ghost-word absolute bottom-[38%] right-[3%] hidden text-[clamp(160px,22vw,340px)] lg:block">
            Tech.
          </div>
          <GlassM className="h-m absolute bottom-[38%] left-1/2 w-[56%] -translate-x-1/2 sm:w-[40%] lg:left-auto lg:right-[11%] lg:w-[min(30vw,460px)] lg:translate-x-0" />
          <Brackets />
          {/* HUD readouts */}
          <div aria-hidden className="tech-mono pointer-events-none absolute right-7 top-[88px] hidden text-right text-[10.5px] uppercase leading-[1.9] text-t3 lg:block">
            <div>
              <span className="t-live mr-1.5 inline-block h-1.5 w-1.5 rounded-full bg-tblue" />
              Status · signing creators
            </div>
            <div>Region · AU → worldwide</div>
            <div>Mode · gaming &amp; tech</div>
          </div>
        </div>

        <div className="wrap pointer-events-none relative z-10 order-1 pt-24 md:pt-32">
          <div className="pointer-events-auto lg:max-w-[50%]">
            <p className="h-fade tech-mono text-[11px] uppercase text-t3">
              <Decode text="Gaming and tech creators" immediate delay={0.3} />
            </p>
            <h1 className="tech-wide mt-4 text-[clamp(42px,6.1vw,100px)] text-t">
              <span className="sr-only">ModeSociety Tech: </span>
              {line("Not just")}
              {line("gaming.")}
            </h1>
            <p className="h-fade mt-6 max-w-xl text-[clamp(17px,1.45vw,21px)] leading-relaxed text-t2">
              We sign streamers, content creators and esports athletes across gaming and wider tech, and build brand campaigns around them.
            </p>
          </div>

        </div>

        <div className="wrap pointer-events-none relative z-10 order-3 pb-10 lg:pb-24">
          <div className="pointer-events-auto grid gap-3 sm:grid-cols-2 lg:max-w-[640px]">
            <div className="h-fade t-panel p-6 backdrop-blur-md">
              <p className="tech-mono text-[11px] uppercase text-t3">Player 1 · For brands</p>
              <h2 className="tech-display mt-3 text-[34px] text-t">Run a campaign.</h2>
              <p className="mt-2 text-[14px] leading-relaxed text-t2">Creator campaigns, UGC, streams and event guest lists, built around your brand.</p>
              <div className="mt-5 flex flex-wrap items-center gap-4">
                <Link href={landing ? "#enquire" : "/tech/contact?as=brand"} className="btn !py-2.5">
                  Brand enquiry <span className="arrow">→</span>
                </Link>
                {!landing && (
                  <Link href="/tech/brands" className="link-underline text-[13px] text-taccent">
                    How a campaign runs
                  </Link>
                )}
              </div>
            </div>
            <div className="h-fade t-panel p-6 backdrop-blur-md">
              <p className="tech-mono text-[11px] uppercase text-t3">Player 2 · For creators</p>
              <h2 className="tech-display mt-3 text-[34px] text-t">Get signed.</h2>
              <p className="mt-2 text-[14px] leading-relaxed text-t2">Management for streamers, creators, players and teams. Adults only, by application.</p>
              <div className="mt-5 flex flex-wrap items-center gap-4">
                <Link href={landing ? "#apply" : "/tech/contact?as=creator"} className="btn !py-2.5">
                  Apply to sign <span className="arrow">→</span>
                </Link>
                {!landing && (
                  <Link href="/tech/creators" className="link-underline text-[13px] text-taccent">
                    What management includes
                  </Link>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* broadcast ticker */}
      <div className="relative border-y border-tline bg-white/80 py-3 backdrop-blur">
        <Marquee speed={42}>
          {ticker.map((t, i) => (
            <span key={`${t}-${i}`} className="tech-mono mx-5 inline-flex items-center gap-3 whitespace-nowrap text-[11.5px] uppercase text-t2">
              {i === 0 ? (
                <span className="inline-flex items-center gap-1.5 rounded-full bg-[#3e5ef1] px-2 py-0.5 text-[10px] text-white">
                  <span className="t-live h-1.5 w-1.5 rounded-full bg-white" /> Live
                </span>
              ) : (
                <span className="text-tblue">◆</span>
              )}
              {t}
            </span>
          ))}
        </Marquee>
      </div>
    </section>
  );
}
