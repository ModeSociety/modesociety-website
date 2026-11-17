import { shownServices, type PricedServicesProps } from "@/components/services/PricedServices";
import type { SectionCopy } from "@/lib/copy";
import { slugify } from "@/lib/press";
import { pixel } from "./pixel";

/** The Services page's title (Tech design): the small label and the headline with its pixel words. */
export function TxServicesHero({ copy: c }: { copy: SectionCopy<"techSite.servicesHero"> }) {
  return (
    <section className="sec svc-hero">
      <div className="wrap">
        <span className="mono" style={{ color: "var(--royal)", display: "block", marginBottom: 20 }}>
          {c.label}
        </span>
        <h1 className="h-l">{pixel(c.heading)}</h1>
      </div>
    </section>
  );
}

/**
 * ModeSociety Tech's services with their tiers and prices (Asha's Tech services copy, 16 Nov 2026),
 * in the Tech design: one frosted card per service, the lime badge on the ones free for exclusive
 * creators, and the footer note.
 */
export default function TxServices({ intro, freeBadge, footer, items, book }: PricedServicesProps) {
  const services = shownServices(items);
  return (
    <section className="sec svc">
      <div className="wrap">
        {intro.trim() && <p className="svc-intro rv">{intro}</p>}
        <ol className="svc-grid">
          {services.map((s, i) => (
            <li key={i} id={slugify(s.title)} className="svc-card rv">
              <div className="svc-top">
                <span className="mono">{String(i + 1).padStart(2, "0")}</span>
                {s.free === "Yes" && freeBadge.trim() && <span className="svc-free mono">{freeBadge}</span>}
              </div>
              <h2>{s.title}</h2>
              {s.body.trim() && <p className="svc-body">{s.body}</p>}
              <ul className="svc-tiers">
                {s.tiers.map((t, k) => (
                  <li key={k}>
                    <div>
                      <h3>{t.name}</h3>
                      {t.includes.trim() && <p>{t.includes}</p>}
                    </div>
                    <div className="svc-price">
                      <span className="mono">{t.price}</span>
                      {book?.(s, t)}
                    </div>
                  </li>
                ))}
              </ul>
              {s.note.trim() && <p className="svc-note">{s.note}</p>}
            </li>
          ))}
        </ol>
        {footer.trim() && <p className="svc-foot">{footer}</p>}
      </div>
    </section>
  );
}
