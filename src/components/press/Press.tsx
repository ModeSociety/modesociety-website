import Link from "next/link";
import { SectionHead } from "@/components/site/Editorial";
import { FadeUp } from "@/components/site/Reveal";
import { responsive } from "@/lib/img";
import { pressDate, pressTeaser, type PressItem } from "@/lib/press";
import type { SiteImage } from "@/lib/slots";

/** Publication logos in a ruled grid, like a masthead index. */
export function PressLogos({ logos }: { logos: SiteImage[] }) {
  if (!logos.length) return null;
  return (
    <ul className="grid grid-cols-2 border-l border-t border-espresso/15 sm:grid-cols-3 lg:grid-cols-4">
      {logos.map((l, i) => (
        <li key={`${l.src}-${i}`} className="grid aspect-[16/9] place-items-center border-b border-r border-espresso/15 p-6 md:p-10">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={l.src} alt={l.alt} loading="lazy" className="max-h-full max-w-full object-contain mix-blend-multiply" />
        </li>
      ))}
    </ul>
  );
}

/** One feature: cover photo, publication, headline, the teaser and "Read more". */
export function PressCard({ item, index, large = false, sizes }: { item: PressItem; index?: number; large?: boolean; sizes: string }) {
  const cover = item.photos[0];
  return (
    <article className={`group relative ${large ? "grid gap-6 md:grid-cols-12 md:items-end md:gap-10" : ""}`}>
      <div className={`grain relative overflow-hidden bg-paper-2 ${large ? "aspect-[4/3] md:col-span-7" : "aspect-[4/5]"}`}>
        {cover ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            {...responsive(cover.src, sizes, large ? 1920 : 1080)}
            alt=""
            loading="lazy"
            className="h-full w-full object-cover transition-transform duration-700 ease-[var(--ease-out)] group-hover:scale-[1.03]"
          />
        ) : (
          <span className="font-display absolute inset-0 grid place-items-center p-6 text-center text-[clamp(36px,4vw,64px)] text-ink/20">{item.outlet}</span>
        )}
      </div>
      <div className={large ? "md:col-span-5" : "mt-4"}>
        <p className="font-mono text-[11px] font-medium uppercase tracking-[0.04em] text-muted">
          {index != null && <span className="mr-3 text-ink">({String(index).padStart(2, "0")})</span>}
          {item.outlet}
          {item.date && <span> · {pressDate(item.date)}</span>}
        </p>
        <h3 className={`font-serif mt-2 italic leading-[1.08] text-ink ${large ? "text-[clamp(34px,3.6vw,56px)]" : "text-[clamp(26px,2.2vw,34px)]"}`}>
          <Link href={`/featured-in/${item.slug}`} className="after:absolute after:inset-0">
            {item.title}
          </Link>
        </h3>
        <p className={`mt-3 leading-relaxed text-ink-2 ${large ? "text-[17px]" : "text-[15px]"}`}>{pressTeaser(item, large ? 320 : 170)}</p>
        <span className="mt-4 inline-flex items-center gap-2 font-mono text-[12px] font-medium uppercase tracking-[0.04em] text-ink">
          <span className="link-underline">Read more</span> <span aria-hidden className="transition-transform group-hover:translate-x-1">→</span>
        </span>
      </div>
    </article>
  );
}

const THIRDS = "(max-width: 639px) 100vw, (max-width: 1023px) 50vw, 33vw";

/** Every feature: the newest large, the rest three to a row. */
export function PressGrid({ items }: { items: PressItem[] }) {
  if (!items.length) return null;
  const [first, ...rest] = items;
  return (
    <div className="grid gap-16 md:gap-24">
      <FadeUp>
        <PressCard item={first} index={1} large sizes="(max-width: 767px) 100vw, 58vw" />
      </FadeUp>
      {rest.length > 0 && (
        <div className="grid gap-x-8 gap-y-14 sm:grid-cols-2 lg:grid-cols-3">
          {rest.map((a, i) => (
            <FadeUp key={a.id} delay={(i % 3) * 0.08}>
              <PressCard item={a} index={i + 2} sizes={THIRDS} />
            </FadeUp>
          ))}
        </div>
      )}
    </div>
  );
}

/** Home page: the publication logos and the three latest features, each with "Read more". Hidden until there's press. */
export function FeaturedStrip({ logos, items, index }: { logos: SiteImage[]; items: PressItem[]; index: string }) {
  if (!logos.length && !items.length) return null;
  return (
    <section className="wrap py-20 md:py-28" aria-label="Featured in">
      <SectionHead index={index} label="Featured in" meta={<Link href="/featured-in" className="link-underline text-ink">All press ↗</Link>} />
      <h2 className="font-display mt-8 text-[clamp(56px,9vw,150px)] text-ink">
        As <span className="font-serif italic">seen in.</span>
      </h2>
      {logos.length > 0 && (
        <div className="mt-10">
          <PressLogos logos={logos.slice(0, 8)} />
        </div>
      )}
      {items.length > 0 && (
        <div className="mt-14 grid gap-x-8 gap-y-14 sm:grid-cols-2 lg:grid-cols-3">
          {items.slice(0, 3).map((a, i) => (
            <FadeUp key={a.id} delay={i * 0.08}>
              <PressCard item={a} index={i + 1} sizes={THIRDS} />
            </FadeUp>
          ))}
        </div>
      )}
      {items.length > 3 && (
        <div className="mt-14">
          <Link href="/featured-in" className="btn">
            See all {items.length} features <span className="arrow">→</span>
          </Link>
        </div>
      )}
    </section>
  );
}
