"use client";

import Link from "next/link";
import { SectionHead } from "@/components/site/Editorial";
import { responsive } from "@/lib/img";
import type { SectionCopy } from "@/lib/copy";
import type { CtaStyle, SiteImage } from "@/lib/slots";

type Panel = { href: string; eyebrow: string; title: string; img?: SiteImage; cta: string };

function panels(c: SectionCopy<"site.cta">, brands?: SiteImage, talent?: SiteImage): Panel[] {
  return [
    { href: "/work-with-us", eyebrow: c.brandsEyebrow, title: c.brandsTitle, img: brands, cta: c.brandsButton },
    { href: "/apply-to-be-a-creator", eyebrow: c.talentEyebrow, title: c.talentTitle, img: talent, cta: c.talentButton },
  ];
}

/** The "For brands / For talent" section. Its look is chosen in the admin panel. */
export default function DualCta({
  brands,
  talent,
  style = "split",
  index,
  copy,
}: {
  brands?: SiteImage;
  talent?: SiteImage;
  style?: CtaStyle;
  index?: string;
  copy: SectionCopy<"site.cta">;
}) {
  const list = panels(copy, brands, talent);
  if (style === "reveal") return <Reveal panels={list} index={index} label={copy.label} />;
  if (style === "tilt") return <Tilt panels={list} index={index} label={copy.label} />;
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
          className="group relative flex flex-1 items-end overflow-hidden bg-ink text-paper transition-[flex-grow] duration-700 ease-[cubic-bezier(.16,1,.3,1)] md:hover:flex-[1.6]"
        >
          {p.img && (
            <img
              {...responsive(p.img.src, "(max-width: 767px) 100vw, 50vw")}
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

/** Big typographic rows that slide across on hover. */
function Reveal({ panels, index, label }: { panels: Panel[]; index?: string; label: string }) {
  return (
    <section className="relative overflow-hidden bg-paper py-20 md:py-28">
      <div className="wrap">
        <SectionHead index={index} label={label} meta="Brands · talent" className="mb-4" />
        {panels.map((p, i) => (
          <Link
            key={p.href}
            href={p.href}
            className="group relative z-10 flex flex-col gap-4 border-b border-espresso/15 py-8 md:flex-row md:items-center md:justify-between md:py-10"
          >
            <span className="flex items-baseline gap-5 md:gap-8">
              <span className="font-mono text-[11px] font-medium text-muted">/0{i + 1}</span>
              <span className="font-display text-[clamp(40px,6.2vw,104px)] text-ink transition-[transform,color] duration-500 group-hover:translate-x-4 group-hover:text-red">
                {p.title}
              </span>
            </span>
            <span className="flex shrink-0 items-center gap-4 whitespace-nowrap font-mono text-[12px] font-medium uppercase tracking-[0.04em] text-ink-2">
              {p.eyebrow} · {p.cta}
              <span className="grid h-12 w-12 place-items-center border border-ink transition-all duration-500 group-hover:bg-ink group-hover:text-paper">
                ↗
              </span>
            </span>
          </Link>
        ))}
      </div>
    </section>
  );
}

/** Two pinned polaroids that tilt toward the cursor with a moving glare. */
function Tilt({ panels, index, label }: { panels: Panel[]; index?: string; label: string }) {
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
    <section className="py-20 md:py-28">
      <div className="wrap">
        <SectionHead index={index} label={label} meta="Brands · talent" className="mb-12" />
        <div className="mx-auto grid max-w-5xl gap-12 md:grid-cols-2 md:gap-20" style={{ perspective: "1200px" }}>
          {panels.map((p, i) => (
            <Link
              key={p.href}
              href={p.href}
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
                  {p.img && <img {...responsive(p.img.src, "420px", 1080)} alt={p.img.alt} loading="lazy" />}
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
                  <span className="grid h-11 w-11 shrink-0 place-items-center border border-ink transition-colors group-hover:bg-ink group-hover:text-paper">→</span>
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
        <Link key={p.href} href={p.href} className="group relative flex items-end overflow-hidden bg-ink text-paper">
          {p.img && (
            <img
              {...responsive(p.img.src, "(max-width: 767px) 100vw, 50vw")}
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
