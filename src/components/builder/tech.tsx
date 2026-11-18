/**
 * ModeSociety Tech's designed sections (Asha's v3.5 design, 6 Nov 2026), as page-builder blocks.
 * The home page is at /tech (its menu links jump down it), and the Services page at /tech/services.
 */
import Contact from "@/components/tx/Contact";
import Film from "@/components/tx/Film";
import { Campaigns, Faq, Hero, Rules, Run, Ticker, Who } from "@/components/tx/Sections";
import TxServices, { TxServicesHero } from "@/components/tx/TxServices";
import BookNow from "@/components/services/BookNow";
import { shownServices } from "@/components/services/PricedServices";
import type { Feature } from "./types";

export const TECH: Record<string, Feature> = {
  "x.hero": { render: ({ c }) => <Hero copy={c.copy["techSite.hero"]} /> },
  "x.ticker": { render: ({ c }) => <Ticker copy={c.copy["techSite.ticker"]} /> },
  "x.film": { shows: ({ c }) => !c.copy["techSite.film"].hidden && Boolean(c.copy["techSite.film"].videoUrl.trim()), render: ({ c }) => <Film copy={c.copy["techSite.film"]} /> },
  "x.who": { shows: ({ c }) => !c.copy["techSite.who"].hidden, render: ({ c }) => <Who copy={c.copy["techSite.who"]} /> },
  "x.campaigns": { shows: ({ c }) => !c.copy["techSite.campaigns"].hidden, render: ({ c }) => <Campaigns copy={c.copy["techSite.campaigns"]} /> },
  "x.run": { shows: ({ c }) => !c.copy["techSite.run"].hidden, render: ({ c }) => <Run copy={c.copy["techSite.run"]} /> },
  "x.rules": { shows: ({ c }) => !c.copy["techSite.rules"].hidden, render: ({ c }) => <Rules copy={c.copy["techSite.rules"]} /> },
  "x.contact": { render: ({ c }) => <Contact copy={c.copy["techSite.contact"]} eligibility={c.eligibility.tech} noGo={c.copy["techSite.rules"].nogo} /> },
  "x.servicesHero": { render: ({ c }) => <TxServicesHero copy={c.copy["techSite.servicesHero"]} /> },
  "x.services": {
    shows: ({ c }) => shownServices(c.copy["techSite.services"].items).length > 0,
    render: ({ c }) => {
      const p = c.copy["techSite.services"];
      return (
        <TxServices
          intro={p.intro}
          freeBadge={p.freeBadge}
          footer={p.footer}
          items={p.items}
          book={(s, t) => p.bookLabel.trim() && <BookNow side="tech" service={s.title.trim()} tier={t.name.trim()} price={t.price} label={p.bookLabel} />}
        />
      );
    },
  },
  "x.faq": { shows: ({ c }) => !c.copy["techSite.faq"].hidden, render: ({ c }) => <Faq copy={c.copy["techSite.faq"]} /> },
};
