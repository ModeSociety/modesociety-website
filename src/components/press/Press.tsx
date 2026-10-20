import Link from "next/link";
import { SectionHead } from "@/components/site/Editorial";
import { PRESS } from "@/lib/content";
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

/** Articles, one per row: outlet, headline, date. */
export function PressList() {
  if (!PRESS.length) return null;
  return (
    <ol className="border-t border-espresso/15">
      {PRESS.map((p, i) => {
        const row = (
          <>
            <span className="font-mono text-[11px] font-medium text-muted md:w-16">({String(i + 1).padStart(2, "0")})</span>
            <span className="font-display text-[clamp(28px,3.6vw,52px)] text-ink md:w-[30%]">{p.outlet}</span>
            <span className="font-serif flex-1 text-[clamp(20px,1.9vw,28px)] italic leading-snug text-ink-2">{p.title}</span>
            <span className="font-mono text-[11px] font-medium uppercase tracking-[0.04em] text-muted">
              {p.date}
              {p.href && <span className="ml-3 text-ink">Read ↗</span>}
            </span>
          </>
        );
        const cls = "group flex flex-col gap-2 border-b border-espresso/15 py-6 md:flex-row md:items-baseline md:gap-8 md:py-8";
        return (
          <li key={`${p.outlet}-${p.title}`}>
            {p.href ? (
              <a href={p.href} target="_blank" rel="noreferrer" className={`${cls} transition-colors hover:bg-paper-2/60`}>
                {row}
              </a>
            ) : (
              <div className={cls}>{row}</div>
            )}
          </li>
        );
      })}
    </ol>
  );
}

/** Home page strip; stays hidden until there's real press to show. */
export function FeaturedStrip({ logos, index }: { logos: SiteImage[]; index: string }) {
  if (!logos.length && !PRESS.length) return null;
  return (
    <section className="wrap py-20 md:py-28" aria-label="Featured in">
      <SectionHead index={index} label="Featured in" meta={<Link href="/featured-in" className="link-underline text-ink">All press ↗</Link>} />
      <h2 className="font-display mt-8 text-[clamp(56px,9vw,150px)] text-ink">
        As <span className="font-serif italic">seen in.</span>
      </h2>
      <div className="mt-10">{logos.length ? <PressLogos logos={logos.slice(0, 8)} /> : <PressList />}</div>
    </section>
  );
}
