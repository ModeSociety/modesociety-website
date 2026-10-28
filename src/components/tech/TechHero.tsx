"use client";

import Link from "next/link";
import { useRef } from "react";
import Marquee from "@/components/site/Marquee";
import { gsap, prefersReducedMotion, useGSAP } from "@/lib/gsap";
import { introDone } from "@/lib/intro";
import type { SectionCopy } from "@/lib/copy";
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
/** Blue → periwinkle → lilac, for the letters of a headline's *accent* words. */
const GRAD = [
  [47, 85, 244],
  [111, 141, 255],
  [155, 140, 255],
];
function gradAt(t: number) {
  const seg = Math.min(GRAD.length - 2, Math.floor(t * (GRAD.length - 1)));
  const f = t * (GRAD.length - 1) - seg;
  const [a, b] = [GRAD[seg], GRAD[seg + 1]];
  return `rgb(${a.map((v, i) => Math.round(v + (b[i] - v) * f)).join(",")})`;
}

export default function TechHero({ landing = false, text }: { landing?: boolean; text: SectionCopy<"techHome.hero"> }) {
  const ref = useRef<HTMLElement>(null);
  useGSAP(
    () => {
      if (prefersReducedMotion()) return;
      // plays as the boot screen (first visit) wipes away
      const tl = gsap.timeline({ paused: true, delay: 0.1 });
      tl.from(".h-letter", { yPercent: 110, duration: 1.1, ease: "expo.out", stagger: 0.03 })
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

  // each letter rises on its own; letters inside *stars* get the blue gradient, letter by letter
  const line = (raw: string, key: number) => {
    const accentCount = (raw.match(/\*[^*]+\*/g) ?? []).join("").replace(/\*/g, "").length;
    let inAccent = false;
    let k = 0;
    const letters: { c: string; color?: string }[] = [];
    for (const c of raw) {
      if (c === "*") {
        inAccent = !inAccent;
        continue;
      }
      letters.push({ c, color: inAccent ? gradAt(accentCount > 1 ? k++ / (accentCount - 1) : 0) : undefined });
    }
    const words: (typeof letters)[] = [[]];
    letters.forEach((l) => (l.c === " " ? words.push([]) : words[words.length - 1].push(l)));
    return (
      <span key={key} className="block overflow-hidden pb-[0.06em]">
        {words.map((word, w) => (
          <span key={w} className="inline-block whitespace-nowrap">
            {word.map((l, i) => (
              <span key={i} className="h-letter inline-block" style={l.color ? { color: l.color } : undefined}>
                {l.c}
              </span>
            ))}
            {w < words.length - 1 && <span className="inline-block">&nbsp;</span>}
          </span>
        ))}
      </span>
    );
  };
  const headingLines = text.heading
    .split("\n")
    .map((l) => l.trim())
    .filter(Boolean);

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
          <div
            aria-hidden
            className="tech-mono pointer-events-none absolute right-7 top-[88px] hidden text-right text-[10.5px] uppercase leading-[1.9] text-t3 lg:block"
          >
            {text.hud.map((h, i) => (
              <div key={`${h}-${i}`}>
                {i === 0 && <span className="t-live mr-1.5 inline-block h-1.5 w-1.5 rounded-full bg-tblue" />}
                {h}
              </div>
            ))}
          </div>
        </div>

        <div className="wrap pointer-events-none relative z-10 order-1 pt-24 md:pt-32">
          <div className="pointer-events-auto lg:max-w-[50%]">
            <p className="h-fade tech-mono text-[11px] uppercase text-t3">
              <Decode text={text.eyebrow} immediate delay={0.3} />
            </p>
            <h1 className="tech-wide mt-4 text-[clamp(42px,6.1vw,100px)] text-t">
              <span className="sr-only">ModeSociety Tech: </span>
              {headingLines.map((l, i) => line(l, i))}
            </h1>
            {text.body && <p className="h-fade mt-6 max-w-xl text-[clamp(17px,1.45vw,21px)] leading-relaxed text-t2">{text.body}</p>}
          </div>
        </div>

        <div className="wrap pointer-events-none relative z-10 order-3 pb-10 lg:pb-24">
          <div className="pointer-events-auto grid gap-3 sm:grid-cols-2 lg:max-w-[640px]">
            <div className="h-fade t-panel p-6 backdrop-blur-md">
              <p className="tech-mono text-[11px] uppercase text-t3">{text.brandsLabel}</p>
              <h2 className="tech-display mt-3 text-[34px] text-t">{text.brandsTitle}</h2>
              <p className="mt-2 text-[14px] leading-relaxed text-t2">{text.brandsBody}</p>
              <div className="mt-5 flex flex-wrap items-center gap-4">
                <Link href={landing ? "#enquire" : "/tech/contact?as=brand"} className="btn !py-2.5">
                  {text.brandsButton || "Brand enquiry"} <span className="arrow">→</span>
                </Link>
                {!landing && (
                  <Link href="/tech/brands" className="link-underline text-[13px] text-taccent">
                    How a campaign runs
                  </Link>
                )}
              </div>
            </div>
            <div className="h-fade t-panel p-6 backdrop-blur-md">
              <p className="tech-mono text-[11px] uppercase text-t3">{text.creatorsLabel}</p>
              <h2 className="tech-display mt-3 text-[34px] text-t">{text.creatorsTitle}</h2>
              <p className="mt-2 text-[14px] leading-relaxed text-t2">{text.creatorsBody}</p>
              <div className="mt-5 flex flex-wrap items-center gap-4">
                <Link href={landing ? "#apply" : "/tech/contact?as=creator"} className="btn !py-2.5">
                  {text.creatorsButton || "Apply to sign"} <span className="arrow">→</span>
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
      {text.ticker.length > 0 && (
        <div className="relative border-y border-tline bg-white/80 py-3 backdrop-blur">
          <Marquee speed={42}>
            {text.ticker.map((t, i) => (
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
      )}
    </section>
  );
}
