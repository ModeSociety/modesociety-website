"use client";

import Link from "next/link";
import { useRef, useState } from "react";
import Dither from "@/components/site/Dither";
import { EXPECT, INSTAGRAM_URL, QUOTE } from "@/lib/content";
import type { SiteImage } from "@/lib/slots";
import { InstagramIcon } from "@/components/site/Icons";
import { useDragScroll } from "@/lib/useDragScroll";

/** A dropdown: the title is always visible, the body slides open. */
export function Accordion({
  items,
  defaultOpen = -1,
  tone = "light",
}: {
  items: { title: React.ReactNode; body: React.ReactNode }[];
  defaultOpen?: number;
  tone?: "light" | "dark";
}) {
  const [open, setOpen] = useState(defaultOpen);
  const line = tone === "dark" ? "border-white/25" : "border-line";
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
              <span className="font-display text-[clamp(18px,2vw,28px)]">{it.title}</span>
              <span
                className={`grid h-9 w-9 shrink-0 place-items-center rounded-full border transition-transform duration-500 ${
                  tone === "dark" ? "border-white/50" : "border-ink"
                } ${isOpen ? "rotate-45" : ""}`}
                aria-hidden
              >
                +
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
export function Quote({ className = "" }: { className?: string }) {
  return (
    <blockquote className={`font-serif text-[clamp(30px,4.6vw,70px)] leading-[1.08] text-ink ${className}`}>
      &ldquo;{QUOTE}&rdquo;
    </blockquote>
  );
}

/** "What you can expect from us": swipe-through cards on the burgundy dithered background. */
export function ExpectCards({ cta = { label: "Book a call", href: "/get-in-touch?form=brands" } }: { cta?: { label: string; href: string } }) {
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
      <div className="wrap grid gap-10 md:grid-cols-12">
        <div className="md:col-span-5">
          <h2 className="font-display text-[clamp(32px,4.6vw,68px)]">
            What you can expect <span className="font-serif italic tracking-normal">from us.</span>
          </h2>
        </div>
        <div className="md:col-span-6 md:col-start-7">
          <p className="text-lg text-white/85">{EXPECT.intro}</p>
        </div>
      </div>
      <div
        ref={track}
        className="mt-12 flex snap-x snap-mandatory scroll-px-[var(--gutter)] gap-4 overflow-x-auto px-[var(--gutter)] pb-6 select-none [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
      >
        {EXPECT.cards.map((c, i) => (
          <article
            key={c.title}
            data-card
            className="flex aspect-[4/5] w-[72vw] shrink-0 snap-start flex-col justify-between rounded-[6px] bg-white p-6 text-ink shadow-[0_30px_60px_-30px_rgba(0,0,0,.5)] sm:w-[300px]"
          >
            <span className="font-display text-[44px] leading-none">{String(i + 1).padStart(2, "0")}</span>
            <div>
              <h3 className="font-display text-[22px]">{c.title}</h3>
              <p className="mt-3 text-[15px] leading-relaxed text-ink-2">{c.body}</p>
            </div>
          </article>
        ))}
        <div className="w-[var(--gutter)] shrink-0" aria-hidden />
      </div>
      <div className="wrap mt-6 flex flex-wrap items-center justify-between gap-4">
        <Link href={cta.href} className="btn light">
          {cta.label} <span className="arrow">→</span>
        </Link>
        <div className="flex gap-2">
          <button onClick={() => scrollBy(-1)} className="social-icon" aria-label="Previous card">
            ←
          </button>
          <button onClick={() => scrollBy(1)} className="social-icon" aria-label="Next card">
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
            <img src={p.src} alt={p.alt} loading="lazy" className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105" />
            <span className="absolute inset-0 grid place-items-center bg-ink/0 text-white opacity-0 transition group-hover:bg-ink/40 group-hover:opacity-100">
              <InstagramIcon className="h-6 w-6" />
            </span>
          </a>
        ))}
      </div>
      <a href={INSTAGRAM_URL} target="_blank" rel="noreferrer" className="mt-3 inline-flex items-center gap-2 text-sm text-ink-2 link-underline">
        <InstagramIcon className="h-4 w-4" /> @modesocietyagency
      </a>
    </div>
  );
}

/** Small numbered steps in a row (e.g. a talent's journey from signing to getting paid). */
export function Steps({ steps }: { steps: { title: string; body: string }[] }) {
  return (
    <ol className="grid gap-px overflow-hidden rounded-[6px] bg-line sm:grid-cols-2 lg:grid-cols-4">
      {steps.map((s, i) => (
        <li key={s.title} className="bg-white p-6">
          <span className="font-display text-[28px] text-ink">{String(i + 1).padStart(2, "0")}</span>
          <h3 className="font-display mt-6 text-[20px] text-ink">{s.title}</h3>
          <p className="mt-2 text-[15px] leading-relaxed text-ink-2">{s.body}</p>
        </li>
      ))}
    </ol>
  );
}
