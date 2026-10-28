import { Accordion } from "@/components/sections/Blocks";
import Accent from "@/components/site/Accent";
import { SectionHead } from "@/components/site/Editorial";
import JsonLd from "@/components/site/JsonLd";
import { faqJsonLd } from "@/lib/seo";

/** Questions and answers, plus the matching FAQ data for search engines. */
export default function Faq({ copy }: { copy: { label: string; heading: string; items: { q: string; a: string }[] } }) {
  const items = copy.items.filter((f) => f.q.trim() && f.a.trim());
  if (!items.length) return null;
  return (
    <section className="wrap py-20 md:py-28" aria-label="Frequently asked questions">
      <SectionHead index="FAQ" label={copy.label} meta={`${items.length} question${items.length === 1 ? "" : "s"}`} className="mb-10" />
      <div className="grid gap-10 md:grid-cols-12">
        <h2 className="font-display text-[clamp(52px,6vw,96px)] text-ink md:col-span-4">
          <Accent text={copy.heading} />
        </h2>
        <div className="md:col-span-8">
          <Accordion
            titleClassName="font-serif text-[clamp(22px,2.1vw,30px)] leading-snug text-ink"
            items={items.map((f) => ({ title: f.q, body: <p className="max-w-2xl text-ink-2">{f.a}</p> }))}
          />
        </div>
      </div>
      <JsonLd data={faqJsonLd(items)} />
    </section>
  );
}
