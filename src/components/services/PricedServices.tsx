import { FadeUp } from "@/components/site/Reveal";
import type { PricedService } from "@/lib/services";
import { slugify } from "@/lib/press";

export type PricedServicesProps = {
  intro: string;
  freeBadge: string;
  footer: string;
  items: PricedService[];
  /** the tier's Book now button (the booking form, SP-127); none while it's not given */
  book?: (service: PricedService, tier: PricedService["tiers"][number]) => React.ReactNode;
};

/** Only services with a name, each with only its named tiers. */
export const shownServices = (items: PricedService[]) =>
  items.filter((s) => s.title.trim()).map((s) => ({ ...s, tiers: s.tiers.filter((t) => t.name.trim()) }));

/**
 * Mode Society's services with their tiers and prices (Asha's services copy, 16 Nov 2026): one card
 * per service, a badge on the ones free for exclusive creators, and the footer note.
 */
export default function PricedServices({ intro, freeBadge, footer, items, book }: PricedServicesProps) {
  const services = shownServices(items);
  return (
    <section className="wrap pb-24 md:pb-32">
      {intro.trim() && (
        <FadeUp>
          <p className="font-serif max-w-3xl text-[clamp(20px,2vw,28px)] italic leading-snug text-ink">{intro}</p>
        </FadeUp>
      )}
      <ol className="mt-12 grid gap-6 lg:grid-cols-2">
        {services.map((s, i) => (
          <li key={i} id={slugify(s.title)} className="scroll-mt-28">
            <FadeUp className="h-full">
              <article className="flex h-full flex-col border border-line bg-white p-6 md:p-8">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <span className="font-mono text-[12px] tracking-[0.14em] text-muted">{String(i + 1).padStart(2, "0")}</span>
                  {s.free === "Yes" && freeBadge.trim() && <span className="rounded-full bg-ink px-3 py-1 text-[11px] font-medium uppercase tracking-[0.06em] text-paper">{freeBadge}</span>}
                </div>
                <h2 className="font-display mt-3 text-[clamp(30px,3vw,44px)] leading-[0.95] text-ink">{s.title}</h2>
                {s.body.trim() && <p className="mt-4 text-[15px] leading-relaxed text-ink-2">{s.body}</p>}
                <ul className="mt-6 grid gap-0 border-t border-line">
                  {s.tiers.map((t, k) => (
                    <li key={k} className="grid gap-2 border-b border-line py-4 sm:grid-cols-[1fr_auto] sm:gap-x-6">
                      <div>
                        <h3 className="text-[16px] font-medium text-ink">{t.name}</h3>
                        {t.includes.trim() && <p className="mt-1 text-[14px] leading-relaxed text-ink-2">{t.includes}</p>}
                      </div>
                      <div className="flex items-start gap-3 sm:flex-col sm:items-end">
                        <span className="whitespace-nowrap font-mono text-[14px] text-ink">{t.price}</span>
                        {book?.(s, t)}
                      </div>
                    </li>
                  ))}
                </ul>
                {s.note.trim() && <p className="mt-4 text-[13px] leading-relaxed text-muted">{s.note}</p>}
              </article>
            </FadeUp>
          </li>
        ))}
      </ol>
      {footer.trim() && <p className="mt-12 max-w-3xl text-[13px] leading-relaxed text-muted">{footer}</p>}
    </section>
  );
}
