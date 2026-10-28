import type { Metadata } from "next";
import JsonLd from "@/components/site/JsonLd";
import { breadcrumbJsonLd, pageMetadata } from "@/lib/seo";
import ServicesShowcase from "@/components/services/ServicesShowcase";
import { accent } from "@/components/site/Accent";
import { SectionHead } from "@/components/site/Editorial";
import { RiseLines } from "@/components/site/Reveal";
import type { ServiceDetail, StepIcon } from "@/lib/content";
import { getSiteContent } from "@/lib/backend";
import { slugify } from "@/lib/press";

export const metadata: Metadata = pageMetadata("services");

export default async function ServicesPage() {
  const { images, copy } = await getSiteContent();
  const hero = copy["services.hero"];
  const [first = "", ...rest] = hero.heading.split("\n").map((l) => l.trim()).filter(Boolean);
  const services: ServiceDetail[] = copy["services.list"].items
    .filter((s) => s.title.trim())
    .map((s, i) => ({
      id: slugify(s.title) || `service-${i + 1}`,
      title: s.title,
      steps: s.steps.filter((st) => st.name.trim()).map((st) => ({ name: st.name, text: st.text, icon: st.icon as StepIcon })),
      cta: { label: s.ctaLabel, href: s.ctaUrl || "/get-in-touch?form=brands" },
      ...(s.moreLabel && s.moreUrl ? { more: { label: s.moreLabel, href: s.moreUrl, external: /^https?:/.test(s.moreUrl) } } : {}),
    }));

  return (
    <>
      <JsonLd data={breadcrumbJsonLd("services")} />
      <section className="wrap pb-12 pt-28 md:pb-16 md:pt-36">
        <SectionHead index="Services" label={hero.label} meta={hero.meta} />
        <RiseLines
          as="h1"
          immediate
          delay={0.15}
          className="font-display mt-6 text-[clamp(62px,13vw,220px)] leading-[0.84] text-ink"
          lines={[
            <span key="first">{accent(first)}</span>,
            // the second line is set smaller, in the italic serif
            ...rest.map((l, i) => (
              <span key={i} className="font-serif block text-[0.62em] italic leading-[1.02]">
                {l.replace(/\*/g, "")}
              </span>
            )),
          ]}
        />
      </section>
      {services.length > 0 && <ServicesShowcase services={services} media={images["services.orbit"]} />}
    </>
  );
}
