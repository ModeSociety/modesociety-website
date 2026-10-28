import type { Metadata } from "next";
import { redirect } from "next/navigation";
import JsonLd from "@/components/site/JsonLd";
import SocialLinks from "@/components/site/SocialLinks";
import PageHead from "@/components/tech/PageHead";
import TechForms from "@/components/tech/TechForms";
import { Eyebrow } from "@/components/tech/ui";
import { breadcrumbJsonLd, pageMetadata } from "@/lib/seo";
import { getSiteContent } from "@/lib/backend";
import { techMode } from "@/lib/techMode";

export const metadata: Metadata = pageMetadata("techContact");

export default async function TechContact({ searchParams }: { searchParams: Promise<Record<string, string | string[] | undefined>> }) {
  const as = (await searchParams).as === "creator" ? "creator" : "brand";
  // before launch the forms are on the landing page
  if ((await techMode()).landing) redirect(as === "creator" ? "/tech#apply" : "/tech#enquire");
  const hero = (await getSiteContent()).copy["techContact.hero"];
  return (
    <>
      <JsonLd data={breadcrumbJsonLd("techContact")} />
      <PageHead eyebrow={hero.eyebrow} title={hero.heading} lead={hero.lead} ghost={hero.ghost} />
      <section className="wrap grid gap-12 pb-24 md:pb-32 lg:grid-cols-12">
        <div className="lg:col-span-8">
          <TechForms key={as} initial={as} />
        </div>
        <aside className="lg:col-span-3 lg:col-start-10">
          <div className="t-panel p-6">
            <Eyebrow>{hero.asideLabel}</Eyebrow>
            <SocialLinks className="mt-4 text-t" />
            {hero.asideText && <p className="mt-6 text-[14px] leading-relaxed text-t2">{hero.asideText}</p>}
          </div>
        </aside>
      </section>
    </>
  );
}
