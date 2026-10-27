"use client";

import Link from "next/link";
import { useRef } from "react";
import { gsap, prefersReducedMotion, useGSAP } from "@/lib/gsap";
import GlassM from "./GlassM";
import { Eyebrow } from "./ui";

/**
 * "NOT JUST GAMING." with the two front doors (brands, creators) on the left and the
 * glass m under a beam on the right, a giant outlined "TECH." behind it.
 */
export default function TechHero() {
  const ref = useRef<HTMLElement>(null);
  useGSAP(
    () => {
      if (prefersReducedMotion()) return;
      gsap
        .timeline({ delay: 0.1 })
        .from(".h-letter", { yPercent: 110, duration: 1.1, ease: "expo.out", stagger: 0.03 })
        .from(".h-fade", { y: 18, duration: 0.9, ease: "expo.out", stagger: 0.08 }, "-=0.8")
        .from(".h-stage", { opacity: 0, scale: 0.94, duration: 1.4, ease: "expo.out" }, 0.2);
    },
    { scope: ref },
  );

  // letters rise one by one, but each word stays whole when the line wraps
  const line = (text: string) => (
    <span className="block overflow-hidden pb-[0.06em]">
      {text.split(" ").map((word, w) => (
        <span key={w} className="inline-block whitespace-nowrap">
          {word.split("").map((c, i) => (
            <span key={i} className="h-letter inline-block">
              {c}
            </span>
          ))}
          {w < text.split(" ").length - 1 && <span className="inline-block">&nbsp;</span>}
        </span>
      ))}
    </span>
  );

  return (
    <section ref={ref} className="relative overflow-hidden pb-16 pt-24 md:pb-24 md:pt-32">
      <div aria-hidden className="pointer-events-none absolute inset-0 bg-[radial-gradient(70%_60%_at_75%_10%,rgba(62,94,241,0.22),transparent_70%)]" />
      <div className="wrap relative grid items-center gap-10 lg:grid-cols-12 lg:gap-8">
        <div className="lg:col-span-6">
          <Eyebrow className="h-fade">Gaming and tech creators</Eyebrow>
          <h1 className="tech-wide mt-4 text-[clamp(42px,6.1vw,96px)] text-white">
            <span className="sr-only">ModeSociety Tech: </span>
            {line("Not just")}
            {line("gaming.")}
          </h1>
          <p className="h-fade mt-6 max-w-xl text-[clamp(17px,1.45vw,21px)] leading-relaxed text-[#d2d8e2]">
            We sign streamers, content creators and esports athletes across gaming and wider tech, and build brand campaigns around them.
          </p>

          <div className="mt-10 grid gap-3 sm:grid-cols-2">
            <div className="h-fade t-panel p-6">
              <Eyebrow>For brands</Eyebrow>
              <h2 className="tech-display mt-3 text-[34px] text-white">Run a campaign.</h2>
              <p className="mt-2 text-[14px] leading-relaxed text-[#aab2c0]">Creator campaigns, UGC, streams and event guest lists, built around your brand.</p>
              <div className="mt-5 flex flex-wrap items-center gap-4">
                <Link href="/tech/contact?as=brand" className="btn !py-2.5">
                  Brand enquiry <span className="arrow">→</span>
                </Link>
                <Link href="/tech/brands" className="link-underline text-[13px] text-[#89b2fd]">
                  How a campaign runs
                </Link>
              </div>
            </div>
            <div className="h-fade t-panel p-6">
              <Eyebrow>For creators</Eyebrow>
              <h2 className="tech-display mt-3 text-[34px] text-white">Get signed.</h2>
              <p className="mt-2 text-[14px] leading-relaxed text-[#aab2c0]">Management for streamers, creators, players and teams. Adults only, by application.</p>
              <div className="mt-5 flex flex-wrap items-center gap-4">
                <Link href="/tech/contact?as=creator" className="btn !py-2.5">
                  Apply to sign <span className="arrow">→</span>
                </Link>
                <Link href="/tech/creators" className="link-underline text-[13px] text-[#89b2fd]">
                  What management includes
                </Link>
              </div>
            </div>
          </div>
        </div>

        <div className="h-stage relative lg:col-span-6">
          <div className="t-panel relative aspect-[4/4.2] overflow-hidden sm:aspect-[4/3.6] lg:aspect-[4/4.4]">
            <div aria-hidden className="t-ghost-word absolute left-1/2 top-[4%] -translate-x-1/2 text-[clamp(120px,19vw,300px)]">
              Tech.
            </div>
            {/* horizon */}
            <div aria-hidden className="absolute inset-x-0 bottom-0 h-[28%] bg-[linear-gradient(180deg,rgba(62,94,241,0.2),rgba(7,8,12,0.92))] shadow-[inset_0_1px_0_rgba(137,178,253,0.35)]" />
            {/* the m stands on the horizon; its reflection falls below it */}
            <GlassM className="absolute bottom-[28%] left-1/2 w-[66%] -translate-x-1/2" />
          </div>
        </div>
      </div>
    </section>
  );
}
