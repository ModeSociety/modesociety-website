"use client";

import Link from "next/link";
import { useRef, useState } from "react";
import Dither from "@/components/site/Dither";
import { SectionHead } from "@/components/site/Editorial";
import { INSTAGRAM_URL } from "@/lib/content";
import type { SectionCopy } from "@/lib/copy";
import Accent from "@/components/site/Accent";
import type { SiteImage } from "@/lib/slots";
import { InstagramIcon } from "@/components/site/Icons";
import { useDragScroll } from "@/lib/useDragScroll";
import { responsive } from "@/lib/img";

/** A dropdown: the title is always visible, the body slides open. */
export function Accordion({
  items,
  defaultOpen = -1,
  tone = "light",
  titleClassName = "font-display text-[clamp(28px,3.2vw,48px)]",
}: {
  items: { title: React.ReactNode; body: React.ReactNode }[];
  defaultOpen?: number;
  tone?: "light" | "dark";
  titleClassName?: string;
}) {
  const [open, setOpen] = useState(defaultOpen);
  const line = tone === "dark" ? "border-white/25" : "border-espresso/15";
  return (
    <div className={`border-t ${line}`}>
      {items.map((it, i) => {
        const isOpen = open === i;
        return (
          <div key={i} className={`border-b ${line}`}>
            <button
              className="flex w-full items-center justify-between gap-6 py-5 text-left md:py-6"
              aria-expanded={isOpen}
              onClick={() => setOpen(isOpen ? -1 : i)}
            >
              <span className={titleClassName}>{it.title}</span>
              <span
                className={`grid h-9 w-9 shrink-0 place-items-center border font-mono text-[18px] leading-none transition-colors duration-300 ${
                  tone === "dark" ? "border-white/50" : "border-ink"
                } ${isOpen ? (tone === "dark" ? "bg-white text-[#07080c]" : "bg-ink text-white") : ""}`}
                aria-hidden
              >
                {isOpen ? "−" : "+"}
              </span>
            </button>
            <div className="grid transition-[grid-template-rows] duration-500 ease-[cubic-bezier(.16,1,.3,1)]" style={{ gridTemplateRows: isOpen ? "1fr" : "0fr" }}>
              <div className="overflow-hidden">
                <div className="pb-7 pr-2 text-[16px] leading-relaxed md:pr-16">{it.body}</div>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}

/** The big pull quote. */
export function Quote({ text, className = "" }: { text: string; className?: string }) {
  if (!text.trim()) return null;
  return (
    <blockquote className={`font-serif text-[clamp(30px,4.6vw,70px)] leading-[1.08] text-ink ${className}`}>
      &ldquo;{text}&rdquo;
    </blockquote>
  );
}

/** "What you can expect from us": swipe-through cards on the burgundy dithered background. */
export function ExpectCards({ copy, href = "/get-in-touch?form=brands" }: { copy: SectionCopy<"site.expect">; href?: string }) {
  const track = useRef<HTMLDivElement>(null);
  useDragScroll(track);
  const scrollBy = (dir: number) => {
    const el = track.current;
    if (!el) return;
    const card = el.querySelector<HTMLElement>("[data-card]");
    el.scrollBy({ left: dir * ((card?.offsetWidth ?? 280) + 16), behavior: "smooth" });
  };
  return (
    <section className="dither-bg relative isolate overflow-hidden py-24 text-white md:py-32">
      <Dither />
      <div className="wrap">
        <SectionHead tone="dark" index="✶" label={copy.label} meta={`${copy.cards.length} things you can count on`} className="mb-8" />
      </div>
      <div className="wrap grid gap-10 md:grid-cols-12">
        <div className="md:col-span-7">
          <h2 className="font-display text-[clamp(56px,7.6vw,124px)]">
            <Accent text={copy.heading} />
          </h2>
        </div>
        <div className="md:col-span-4 md:col-start-9 md:self-end">
          <p className="text-lg text-white/85">{copy.intro}</p>
        </div>
      </div>
      <div
        ref={track}
        className="mt-12 flex snap-x snap-mandatory scroll-px-[var(--gutter)] gap-4 overflow-x-auto px-[var(--gutter)] pb-6 select-none [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
      >
        {copy.cards.map((c, i) => (
          <article
            key={`${c.title}-${i}`}
            data-card
            className="flex aspect-[4/5] w-[72vw] shrink-0 snap-start flex-col justify-between bg-white p-6 text-ink shadow-[0_30px_60px_-30px_rgba(0,0,0,.5)] sm:w-[300px]"
          >
            <div>
              <h3 className="font-display text-[clamp(38px,10vw,46px)] leading-[0.92]">{c.title}</h3>
              <p className="mt-4 text-[15px] leading-relaxed text-ink-2">{c.body}</p>
            </div>
            <div className="flex items-end justify-between border-t border-espresso/15 pt-3">
              <span className="font-mono text-[11px] font-medium uppercase tracking-[0.04em] text-muted">Mode Society</span>
              <span className="font-display text-[22px] leading-none">{String(i + 1).padStart(2, "0")}</span>
            </div>
          </article>
        ))}
        <div className="w-[var(--gutter)] shrink-0" aria-hidden />
      </div>
      <div className="wrap mt-6 flex flex-wrap items-center justify-between gap-4">
        {copy.button ? (
          <Link href={href} className="btn light">
            {copy.button} <span className="arrow">→</span>
          </Link>
        ) : (
          <span />
        )}
        <div className="flex gap-2">
          <button onClick={() => scrollBy(-1)} className="social-icon !rounded-none" aria-label="Previous card">
            ←
          </button>
          <button onClick={() => scrollBy(1)} className="social-icon !rounded-none" aria-label="Next card">
            →
          </button>
        </div>
      </div>
    </section>
  );
}

/** A grid of recent Instagram posts (from the "Instagram" Drive folder) linking to the profile. */
export function InstagramGrid({ posts }: { posts: SiteImage[] }) {
  if (!posts.length) return null;
  return (
    <div>
      <div className="grid grid-cols-3 gap-1.5">
        {posts.slice(0, 9).map((p, i) => (
          <a
            key={`${p.src}-${i}`}
            href={INSTAGRAM_URL}
            target="_blank"
            rel="noreferrer"
            className="group relative aspect-square overflow-hidden bg-paper-2"
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img {...responsive(p.src, "(max-width: 767px) 33vw, 160px", 640)} alt={p.alt} loading="lazy" className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105" />
            <span className="absolute inset-0 grid place-items-center bg-ink/0 text-white opacity-0 transition group-hover:bg-ink/40 group-hover:opacity-100">
              <InstagramIcon className="h-6 w-6" />
            </span>
          </a>
        ))}
      </div>
      <a href={INSTAGRAM_URL} target="_blank" rel="noreferrer" className="mt-3 inline-flex items-center gap-2 font-mono text-[12px] uppercase tracking-[0.04em] text-ink-2 link-underline">
        <InstagramIcon className="h-4 w-4" /> @modesocietyagency
      </a>
    </div>
  );
}

/** Small numbered steps in a row (e.g. a talent's journey from signing to getting paid). */
export function Steps({ steps }: { steps: { title: string; body: string }[] }) {
  return (
    <ol className="grid gap-px overflow-hidden border border-espresso/15 bg-espresso/15 sm:grid-cols-2 lg:grid-cols-4">
      {steps.map((s, i) => (
        <li key={`${s.title}-${i}`} className="flex flex-col justify-between gap-8 bg-white p-6">
          <div>
            <h3 className="font-display text-[clamp(34px,3vw,44px)] text-ink">{s.title}</h3>
            <p className="mt-3 text-[15px] leading-relaxed text-ink-2">{s.body}</p>
          </div>
          <span className="font-mono text-[11px] font-medium text-muted">Step {String(i + 1).padStart(2, "0")}</span>
        </li>
      ))}
    </ol>
  );
}
