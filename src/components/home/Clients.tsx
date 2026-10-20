import { SectionHead } from "@/components/site/Editorial";
import Marquee from "@/components/site/Marquee";
import type { SiteImage } from "@/lib/slots";

/** Repeats a short list so a marquee row is always wider than the screen. */
function fill(list: SiteImage[], min = 8) {
  if (!list.length) return list;
  const out = [...list];
  while (out.length < min) out.push(...list);
  return out;
}

function Row({ logos, reverse }: { logos: SiteImage[]; reverse?: boolean }) {
  return (
    <Marquee speed={38} reverse={reverse} className="py-4 md:py-6">
      {logos.map((l, i) => (
        <span key={`${l.src}-${i}`} className="mx-6 flex h-[clamp(52px,7vw,96px)] w-[clamp(130px,16vw,230px)] shrink-0 items-center justify-center md:mx-10">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={l.src}
            alt={l.alt}
            loading="lazy"
            draggable={false}
            // multiply makes any white logo background vanish into the page (Drive files aren't pre-processed)
            className="max-h-full max-w-full object-contain mix-blend-multiply"
          />
        </span>
      ))}
    </Marquee>
  );
}

/** "Brands our creators have worked with": a two-row slideshow, the rows sliding in opposite directions. */
export default function Clients({ logos, index }: { logos: SiteImage[]; index?: string }) {
  if (!logos.length) return null;
  const top = logos.filter((_, i) => i % 2 === 0);
  const bottom = logos.length > 1 ? logos.filter((_, i) => i % 2 === 1) : logos;

  return (
    <section className="overflow-hidden py-20 md:py-28" aria-label="Brands our creators have worked with">
      <div className="wrap">
        <SectionHead index={index} label="Clients" meta={`${logos.length} brands & counting`} />
        <div className="mt-8 flex flex-wrap items-end gap-x-6 gap-y-2">
          <h2 className="font-display text-[clamp(80px,15vw,250px)] leading-[0.82] text-ink">Brands</h2>
          <p className="font-serif pb-[0.4em] text-[clamp(22px,2.6vw,40px)] italic leading-none text-ink">our creators have worked with</p>
        </div>
      </div>
      <div className="mt-10 border-y border-espresso/10 md:mt-14">
        <Row logos={fill(top)} />
        <div className="border-t border-espresso/10" />
        <Row logos={fill(bottom)} reverse />
      </div>
    </section>
  );
}
