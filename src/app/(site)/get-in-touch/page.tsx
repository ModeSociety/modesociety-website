import type { Metadata } from "next";
import JsonLd from "@/components/site/JsonLd";
import { breadcrumbJsonLd, pageMetadata } from "@/lib/seo";
import GetInTouch, { type FormKey } from "@/components/forms/GetInTouch";
import { SectionHead } from "@/components/site/Editorial";
import { headingLines } from "@/components/site/Accent";
import { FadeUp, RiseLines } from "@/components/site/Reveal";
import SocialLinks from "@/components/site/SocialLinks";
import { getSiteContent } from "@/lib/backend";

export const metadata: Metadata = pageMetadata("contact");

const KEYS: FormKey[] = ["talent", "brands", "partner"];

export default async function GetInTouchPage({ searchParams }: { searchParams: Promise<Record<string, string | string[] | undefined>> }) {
  const q = await searchParams;
  const form = KEYS.find((k) => k === q.form) ?? null;
  const tech = q.for === "tech";
  const { copy } = await getSiteContent();
  const hero = copy["contact.hero"];
  return (
    <>
      <JsonLd data={breadcrumbJsonLd("contact")} />
      <section className="wrap pb-10 pt-28 md:pt-36">
        <SectionHead index="Contact" label={hero.label} meta={hero.meta} />
        <RiseLines
          as="h1"
          immediate
          delay={0.15}
          className="font-display mt-6 text-[clamp(62px,15vw,250px)] leading-[0.84] text-ink"
          lines={headingLines(hero.heading)}
        />
        <FadeUp delay={0.3}>
          {hero.line && <p className="font-serif mt-8 max-w-3xl text-[clamp(22px,2.6vw,38px)] italic leading-snug">{hero.line}</p>}
        </FadeUp>
      </section>

      <GetInTouch initial={form} partnerTypeHint={tech ? "Tech company" : ""} cards={copy["contact.cards"]} intros={copy["site.forms"]} />

      <section className="wrap pb-24 pt-10 md:pb-32">
        <div className="flex flex-col items-start gap-5 border-t border-espresso/15 pt-10 md:flex-row md:items-center md:justify-between">
          <p className="font-serif text-[clamp(22px,2.4vw,34px)] italic">{hero.socials}</p>
          <SocialLinks className="text-ink" />
        </div>
      </section>
    </>
  );
}
