import type { Metadata } from "next";
import JsonLd from "@/components/site/JsonLd";
import SocialLinks from "@/components/site/SocialLinks";
import PageHead from "@/components/tech/PageHead";
import TechForms from "@/components/tech/TechForms";
import { Eyebrow } from "@/components/tech/ui";
import { breadcrumbJsonLd, pageMetadata } from "@/lib/seo";
import { TECH_CONTACT_LINE } from "@/lib/tech";

export const metadata: Metadata = pageMetadata("techContact");

export default async function TechContact({ searchParams }: { searchParams: Promise<Record<string, string | string[] | undefined>> }) {
  const as = (await searchParams).as === "creator" ? "creator" : "brand";
  return (
    <>
      <JsonLd data={breadcrumbJsonLd("techContact")} />
      <PageHead eyebrow="Contact" title="Let's work together." lead={TECH_CONTACT_LINE} ghost="Hello." />
      <section className="wrap grid gap-12 pb-24 md:pb-32 lg:grid-cols-12">
        <div className="lg:col-span-8">
          <TechForms key={as} initial={as} />
        </div>
        <aside className="lg:col-span-3 lg:col-start-10">
          <div className="t-panel p-6">
            <Eyebrow>Follow us</Eyebrow>
            <SocialLinks className="mt-4 text-t" />
            <p className="mt-6 text-[14px] leading-relaxed text-t2">New signings, streams and campaigns, as they happen.</p>
          </div>
        </aside>
      </section>
    </>
  );
}
