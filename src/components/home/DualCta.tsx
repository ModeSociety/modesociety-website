"use client";

import Link from "next/link";
import type { SiteImage } from "@/lib/slots";

/** Two panels that trade width on hover, like choosing a door. */
export default function DualCta({ brands, talent }: { brands?: SiteImage; talent?: SiteImage }) {
  const panels = [
    { href: "/work-with-us", eyebrow: "For brands", title: "Cast your next campaign", img: brands, cta: "Work with us" },
    { href: "/apply-to-be-a-creator", eyebrow: "For talent", title: "Thinking of signing?", img: talent, cta: "Apply now" },
  ];
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
            // eslint-disable-next-line @next/next/no-img-element
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
