import type { Metadata } from "next";
import JsonLd from "@/components/site/JsonLd";
import { breadcrumbJsonLd, pageMetadata } from "@/lib/seo";
import ServicesShowcase from "@/components/services/ServicesShowcase";
import { SectionHead } from "@/components/site/Editorial";
import { RiseLines } from "@/components/site/Reveal";
import { SERVICES_PAGE } from "@/lib/content";
import { getSiteContent } from "@/lib/backend";

export const metadata: Metadata = pageMetadata("services");

export default async function ServicesPage() {
  const { images } = await getSiteContent();
  return (
    <>
      <JsonLd data={breadcrumbJsonLd("services")} />
      <section className="wrap pb-12 pt-28 md:pb-16 md:pt-36">
        <SectionHead index="Services" label="How it works" meta="No price list: every package is built around you" />
        <RiseLines
          as="h1"
          immediate
          delay={0.15}
          className="font-display mt-6 text-[clamp(62px,13vw,220px)] leading-[0.84] text-ink"
          lines={["Four ways", <span key="t" className="font-serif block text-[0.62em] italic leading-[1.02]">we work with brands.</span>]}
        />
      </section>
      <ServicesShowcase services={SERVICES_PAGE} media={images["services.orbit"]} />
    </>
  );
}
