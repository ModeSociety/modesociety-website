/**
 * ModeSociety Tech's designed sections (Asha's v3.5 design, 6 Nov 2026), as page-builder blocks.
 * The page is one page at /tech; the menu links jump down it.
 */
import Contact from "@/components/tx/Contact";
import Film from "@/components/tx/Film";
import { Campaigns, Faq, Hero, Rules, Run, Ticker, Who } from "@/components/tx/Sections";
import type { Feature } from "./types";

export const TECH: Record<string, Feature> = {
  "x.hero": { render: ({ c }) => <Hero copy={c.copy["techSite.hero"]} /> },
  "x.ticker": { render: ({ c }) => <Ticker copy={c.copy["techSite.ticker"]} /> },
  "x.film": { shows: ({ c }) => !c.copy["techSite.film"].hidden && Boolean(c.copy["techSite.film"].videoUrl.trim()), render: ({ c }) => <Film copy={c.copy["techSite.film"]} /> },
  "x.who": { shows: ({ c }) => !c.copy["techSite.who"].hidden, render: ({ c }) => <Who copy={c.copy["techSite.who"]} /> },
  "x.campaigns": { shows: ({ c }) => !c.copy["techSite.campaigns"].hidden, render: ({ c }) => <Campaigns copy={c.copy["techSite.campaigns"]} /> },
  "x.run": { shows: ({ c }) => !c.copy["techSite.run"].hidden, render: ({ c }) => <Run copy={c.copy["techSite.run"]} /> },
  "x.rules": { shows: ({ c }) => !c.copy["techSite.rules"].hidden, render: ({ c }) => <Rules copy={c.copy["techSite.rules"]} /> },
  "x.contact": { render: ({ c }) => <Contact copy={c.copy["techSite.contact"]} /> },
  "x.faq": { shows: ({ c }) => !c.copy["techSite.faq"].hidden, render: ({ c }) => <Faq copy={c.copy["techSite.faq"]} /> },
};
