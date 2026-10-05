"use client";

import Link from "next/link";
import { useRef, useState } from "react";
import type { CtaStyle, SiteImage } from "@/lib/slots";
import Logo from "@/components/site/Logo";

type Panel = { href: string; eyebrow: string; title: string; img?: SiteImage; cta: string };

function panels(brands?: SiteImage, talent?: SiteImage): Panel[] {
  return [
    { href: "/work-with-us", eyebrow: "For brands", title: "Cast your next campaign", img: brands, cta: "Work with us" },
    { href: "/apply-to-be-a-creator", eyebrow: "For talent", title: "Thinking of signing?", img: talent, cta: "Apply now" },
  ];
}

/** The "For brands / For talent" section. Its look is chosen in the admin panel. */
export default function DualCta({ brands, talent, style = "split" }: { brands?: SiteImage; talent?: SiteImage; style?: CtaStyle }) {
  const list = panels(brands, talent);
  if (style === "reveal") return <Reveal panels={list} />;
  if (style === "tilt") return <Tilt panels={list} />;
  if (style === "blinds") return <Blinds panels={list} />;
  return <Split panels={list} />;
}

/* eslint-disable @next/next/no-img-element */

/** Two panels that trade width on hover, like choosing a door. */
function Split({ panels }: { panels: Panel[] }) {
  return (
    <section className="flex h-[85svh] min-h-[520px] flex-col md:flex-row">
      {panels.map((p) => (
        <Link
          key={p.href}
          href={p.href}
          data-cursor="open"
          className="group relative flex flex-1 items-end overflow-hidden bg-ink text-paper transition-[flex-grow] duration-700 ease-[cubic-bezier(.16,1,.3,1)] md:hover:flex-[1.6]"
        >
          {p.img && (
            <img
              src={p.img.src}
              alt={p.img.alt}
              loading="lazy"
              className="absolute inset-0 h-full w-full object-cover opacity-60 grayscale transition-all duration-1000 group-hover:scale-105 group-hover:opacity-80 group-hover:grayscale-0"
            />
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/10 to-transparent" />
          <div className="relative w-full p-[var(--gutter)] pb-10">
            <p className="eyebrow !text-paper/60">{p.eyebrow}</p>
            <h3 className="font-display mt-3 text-[clamp(26px,3.6vw,56px)]">{p.title}</h3>
            <span className="mt-6 inline-flex items-center gap-3 text-[12px] uppercase tracking-[0.18em]">
              <span className="h-px w-10 bg-paper transition-all duration-700 group-hover:w-20" /> {p.cta}
            </span>
          </div>
        </Link>
      ))}
    </section>
  );
}

/** Big typographic rows; a tilted photo follows the cursor while you hover a row. */
function Reveal({ panels }: { panels: Panel[] }) {
  const section = useRef<HTMLElement>(null);
  const float = useRef<HTMLDivElement>(null);
  const [active, setActive] = useState<number | null>(null);
  const target = useRef({ x: 0, y: 0 });
  const pos = useRef({ x: 0, y: 0 });
  const raf = useRef(0);

  const loop = () => {
    pos.current.x += (target.current.x - pos.current.x) * 0.32;
    pos.current.y += (target.current.y - pos.current.y) * 0.32;
    const vx = target.current.x - pos.current.x;
    if (float.current) {
      float.current.style.transform = `translate3d(${pos.current.x}px, ${pos.current.y}px, 0) translate(-50%, -50%) rotate(${Math.max(-12, Math.min(12, vx * 0.08))}deg)`;
    }
    raf.current = requestAnimationFrame(loop);
  };
  const onMove = (e: React.PointerEvent) => {
    const r = section.current!.getBoundingClientRect();
    target.current = { x: e.clientX - r.left, y: e.clientY - r.top };
  };
  const enter = (e: React.PointerEvent) => {
    onMove(e);
    pos.current = { ...target.current };
    cancelAnimationFrame(raf.current);
    raf.current = requestAnimationFrame(loop);
  };
  const leave = () => {
    setActive(null);
    cancelAnimationFrame(raf.current);
  };

  return (
    <section
      ref={section}
      data-cursor-hide
      className="relative overflow-hidden bg-paper py-20 md:py-28 md:[&_*]:!cursor-none md:!cursor-none"
      onPointerMove={onMove}
      onPointerEnter={enter}
      onPointerLeave={leave}
    >
      <div className="wrap">
        <p className="eyebrow mb-8">Let&apos;s work together</p>
        {panels.map((p, i) => (
          <Link
            key={p.href}
            href={p.href}
            data-cursor="open"
            onPointerEnter={() => setActive(i)}
            className="group relative z-10 flex flex-col gap-4 border-t border-line py-8 last:border-b md:flex-row md:items-center md:justify-between md:py-12"
          >
            <span className="flex items-baseline gap-6">
              <span className="font-serif text-lg italic text-muted">0{i + 1}</span>
              <span className="font-display text-[clamp(30px,5.2vw,84px)] transition-transform duration-500 group-hover:translate-x-4">
                {p.title}
              </span>
            </span>
            <span className="flex items-center gap-4 text-[12px] uppercase tracking-[0.18em] text-ink-2">
              {p.eyebrow} · {p.cta}
              <span className="grid h-12 w-12 place-items-center rounded-full border border-ink transition-all duration-500 group-hover:bg-ink group-hover:text-paper">
                →
              </span>
            </span>
          </Link>
        ))}
      </div>
      <div
        ref={float}
        className="pointer-events-none absolute left-0 top-0 z-30 hidden text-ink md:block"
        style={{ opacity: active === null ? 0 : 1, transition: "opacity .35s" }}
        aria-hidden
      >
        {/* the logo follows the cursor across the rows */}
        <Logo className="h-[clamp(34px,3.6vw,52px)] text-[clamp(20px,2vw,30px)] opacity-90 drop-shadow-[0_6px_16px_rgba(74,5,7,.25)]" />
      </div>
    </section>
  );
}

/** Two pinned polaroids that tilt toward the cursor with a moving glare. */
function Tilt({ panels }: { panels: Panel[] }) {
  const onMove = (e: React.PointerEvent<HTMLAnchorElement>) => {
    const el = e.currentTarget;
    const r = el.getBoundingClientRect();
    const x = (e.clientX - r.left) / r.width - 0.5;
    const y = (e.clientY - r.top) / r.height - 0.5;
    el.style.setProperty("--rx", `${-y * 14}deg`);
    el.style.setProperty("--ry", `${x * 18}deg`);
    el.style.setProperty("--gx", `${(x + 0.5) * 100}%`);
    el.style.setProperty("--gy", `${(y + 0.5) * 100}%`);
  };
  const reset = (e: React.PointerEvent<HTMLAnchorElement>) => {
    e.currentTarget.style.setProperty("--rx", "0deg");
    e.currentTarget.style.setProperty("--ry", "0deg");
  };
  return (
    <section className="bg-paper-2/60 py-20 md:py-28">
      <div className="wrap">
        <p className="eyebrow mb-12 text-center">Let&apos;s work together</p>
        <div className="mx-auto grid max-w-5xl gap-12 md:grid-cols-2 md:gap-20" style={{ perspective: "1200px" }}>
          {panels.map((p, i) => (
            <Link
              key={p.href}
              href={p.href}
              data-cursor="open"
              onPointerMove={onMove}
              onPointerLeave={reset}
              className="group block"
              style={{
                transform: `rotateX(var(--rx, 0deg)) rotateY(var(--ry, 0deg)) rotate(${i ? 2 : -2}deg)`,
                transition: "transform .5s cubic-bezier(.16,1,.3,1)",
                transformStyle: "preserve-3d",
              }}
            >
              <div
                className="polaroid !relative mx-auto"
                style={{ ["--w" as string]: "min(84vw, 420px)", paddingBottom: "calc(var(--w) * 0.3)" }}
              >
                <span className="pin" style={{ ["--pin-color" as string]: i ? "#b08d57" : "#c3362b" }} />
                <div className="photo !aspect-[4/4.2]">
                  {p.img && <img src={p.img.src} alt={p.img.alt} loading="lazy" />}
                  <span
                    className="pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-500 group-hover:opacity-100"
                    style={{ background: "radial-gradient(circle at var(--gx,50%) var(--gy,50%), rgba(255,255,255,.45), transparent 55%)" }}
                  />
                </div>
                <div className="absolute inset-x-[6%] bottom-[5%] flex items-end justify-between gap-4">
                  <div>
                    <p className="eyebrow">{p.eyebrow}</p>
                    <h3 className="font-display mt-1 text-[clamp(16px,1.6vw,22px)]">{p.title}</h3>
                  </div>
                  <span className="grid h-11 w-11 shrink-0 place-items-center rounded-full border border-ink transition-colors group-hover:bg-ink group-hover:text-paper">→</span>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}

/** Ink slats that open like venetian blinds to reveal each photo. */
function Blinds({ panels }: { panels: Panel[] }) {
  const SLATS = 7;
  return (
    <section className="grid h-[85svh] min-h-[520px] md:grid-cols-2">
      {panels.map((p) => (
        <Link key={p.href} href={p.href} data-cursor="open" className="group relative flex items-end overflow-hidden bg-ink text-paper">
          {p.img && (
            <img
              src={p.img.src}
              alt={p.img.alt}
              loading="lazy"
              className="absolute inset-0 h-full w-full object-cover transition-transform duration-[1400ms] group-hover:scale-105"
            />
          )}
          <div className="absolute inset-0 flex" aria-hidden>
            {Array.from({ length: SLATS }).map((_, s) => (
              <span
                key={s}
                className="h-full flex-1 origin-left bg-ink transition-transform duration-700 ease-[cubic-bezier(.65,0,.35,1)] group-hover:scale-x-0"
                style={{ transitionDelay: `${s * 45}ms`, borderRight: "1px solid rgba(243,239,231,.06)" }}
              />
            ))}
          </div>
          <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent opacity-0 transition-opacity duration-700 group-hover:opacity-100" />
          <div className="relative w-full p-[var(--gutter)] pb-10">
            <p className="eyebrow !text-paper/60">{p.eyebrow}</p>
            <h3 className="font-display mt-3 text-[clamp(26px,3.6vw,56px)]">{p.title}</h3>
            <span className="mt-6 inline-flex items-center gap-3 text-[12px] uppercase tracking-[0.18em]">
              <span className="h-px w-10 bg-paper transition-all duration-700 group-hover:w-20" /> {p.cta}
            </span>
            <span className="mt-3 block text-xs text-paper/40 transition-opacity group-hover:opacity-0">Hover to open the blinds</span>
          </div>
        </Link>
      ))}
    </section>
  );
}
