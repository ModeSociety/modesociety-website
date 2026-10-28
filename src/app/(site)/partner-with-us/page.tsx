import type { Metadata } from "next";
import JsonLd from "@/components/site/JsonLd";
import { breadcrumbJsonLd, pageMetadata } from "@/lib/seo";
import PartnerForm from "@/components/forms/PartnerForm";
import { SectionHead } from "@/components/site/Editorial";
import { headingLines } from "@/components/site/Accent";
import { RiseLines } from "@/components/site/Reveal";
import { getSiteContent } from "@/lib/backend";

export const metadata: Metadata = pageMetadata("partner");

export default async function PartnerWithUs({ searchParams }: { searchParams: Promise<Record<string, string | string[] | undefined>> }) {
  const q = await searchParams;
  const { copy } = await getSiteContent();
  const hero = copy["partner.hero"];
  return (
    <>
      <JsonLd data={breadcrumbJsonLd("partner")} />
      <section className="wrap pb-24 pt-28 md:pb-32 md:pt-36">
      <SectionHead index="Partners" label={hero.label} meta={hero.meta} />
      <RiseLines
        as="h1"
        immediate
        delay={0.15}
        className="font-display mt-6 text-[clamp(62px,14vw,240px)] leading-[0.84] text-ink"
        lines={headingLines(hero.heading)}
      />
      <div className="mt-12 max-w-4xl md:mt-16">
        <PartnerForm intro={copy["site.forms"].partner} typeHint={q.for === "tech" ? "Tech company" : ""} />
      </div>
    </section>
    </>
  );
}
