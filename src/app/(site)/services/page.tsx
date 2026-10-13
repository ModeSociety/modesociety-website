import type { Metadata } from "next";
import ServicesShowcase from "@/components/services/ServicesShowcase";
import { RiseLines } from "@/components/site/Reveal";
import { SERVICES_PAGE } from "@/lib/content";
import { getSiteContent } from "@/lib/backend";

export const metadata: Metadata = { title: "Services" };

export default async function ServicesPage() {
  const { images } = await getSiteContent();
  return (
    <>
      <section className="wrap pb-12 pt-32 md:pb-16 md:pt-44">
        <p className="eyebrow">Services</p>
        <RiseLines
          as="h1"
          immediate
          delay={0.15}
          className="font-display mt-5 text-[clamp(40px,6.4vw,100px)]"
          lines={["Four ways", <span key="t" className="font-serif italic tracking-normal">we work with brands.</span>]}
        />
      </section>
      <ServicesShowcase services={SERVICES_PAGE} media={images["services.orbit"]} />
    </>
  );
}
