import Link from "next/link";
import { SectionHead } from "@/components/site/Editorial";
import type { SiteImage } from "@/lib/slots";
import WorkMedia, { workNo } from "./WorkMedia";

/** Home page: a strip of recent work under a big headline, linking to the archive. */
export default function WorkTeaser({ items, index = "03" }: { items: SiteImage[]; index?: string }) {
  const picks = items.slice(0, 4);
  if (!picks.length) return null;
  return (
    <section className="wrap py-20 md:py-28" aria-label="Our work">
      <SectionHead index={index} label="Our work" meta="Selected campaigns" />
      <div className="mt-8 flex flex-col justify-between gap-6 md:flex-row md:items-end">
        <h2 className="font-display text-[clamp(64px,11vw,180px)] text-ink">
          Selected <span className="font-serif italic">work.</span>
        </h2>
        <div className="max-w-sm md:pb-3">
          <p className="text-[16px] leading-relaxed text-ink-2">
            Influencer campaigns, UGC and event guest lists for brands from fashion and beauty to gaming and food.
          </p>
          <Link href="/our-work" className="btn mt-5">
            See all work <span className="arrow">↗</span>
          </Link>
        </div>
      </div>
      <div className="mt-10 grid grid-cols-2 gap-2 md:mt-14 md:grid-cols-4 md:gap-3">
        {picks.map((m, i) => (
          <Link key={`${m.src}-${i}`} href="/our-work" className="group block">
            <WorkMedia item={m} className="aspect-[4/5]" sizes="(max-width: 767px) 50vw, 25vw" />
            <p className="mt-2 flex justify-between gap-3 font-mono text-[12px] font-medium uppercase tracking-[0.04em] text-muted">
              <span>
                <span className="text-ink">{workNo(i)}</span> — {m.alt}
              </span>
              <span className="transition-transform duration-500 group-hover:translate-x-1">→</span>
            </p>
          </Link>
        ))}
      </div>
    </section>
  );
}
