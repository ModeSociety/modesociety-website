import type { Metadata } from "next";
import JsonLd from "@/components/site/JsonLd";
import { breadcrumbJsonLd, pageMetadata } from "@/lib/seo";
import Link from "next/link";
import BrandForm from "@/components/forms/BrandForm";
import Clients from "@/components/home/Clients";
import Infographic from "@/components/home/Infographic";
import Services from "@/components/home/Services";
import { ExpectCards, InstagramGrid, Quote } from "@/components/sections/Blocks";
import Accent, { headingLines } from "@/components/site/Accent";
import { SectionHead } from "@/components/site/Editorial";
import { FadeUp, RiseLines } from "@/components/site/Reveal";
import Faq from "@/components/sections/Faq";
import { getSiteContent } from "@/lib/backend";

export const metadata: Metadata = pageMetadata("brands");

export default async function ForBrands() {
  const { images, copy } = await getSiteContent();
  const hero = copy["brands.hero"];
  const approach = copy["brands.approach"];
  const form = copy["brands.form"];
  return (
    <>
      <JsonLd data={breadcrumbJsonLd("brands")} />
      <section className="wrap pt-28 md:pt-36">
        <SectionHead index="For brands" label={hero.label} meta={hero.meta} />
      </section>
      <section className="wrap grid gap-12 pb-16 pt-6 md:grid-cols-12 md:pb-24">
        <div className="md:col-span-7">
          <RiseLines as="h1" immediate delay={0.15} className="font-display text-[clamp(62px,12.5vw,210px)] leading-[0.84] text-ink" lines={headingLines(hero.heading)} />
          <FadeUp delay={0.35} className="mt-8 max-w-xl">
            {hero.body && <p className="text-[clamp(17px,1.4vw,20px)] leading-relaxed text-ink-2">{hero.body}</p>}
            {hero.button && (
              <Link href="/get-in-touch?form=brands" className="btn mt-8">
                {hero.button} <span className="arrow">→</span>
              </Link>
            )}
          </FadeUp>
        </div>
        <FadeUp delay={0.3} className="md:col-span-4 md:col-start-9 md:pt-4">
          <InstagramGrid posts={images["brands.instagram"]} />
        </FadeUp>
      </section>

      <Services copy={copy["site.services"]} />

      {!approach.hidden && copy["site.quote"].quote.trim() && (
        <section className="wrap py-20 md:py-28">
          <SectionHead index="✶" label={approach.label} className="mb-10" />
          <FadeUp>
            <Quote text={copy["site.quote"].quote} className="max-w-5xl" />
          </FadeUp>
        </section>
      )}

      {!copy["site.expect"].hidden && <ExpectCards copy={copy["site.expect"]} href="#book" />}

      {!copy["site.numbers"].hidden && <Infographic copy={copy["site.numbers"]} />}

      {!copy["site.clients"].hidden && <Clients logos={images["home.clients"]} copy={copy["site.clients"]} />}

      {!copy["brands.faq"].hidden && <Faq copy={copy["brands.faq"]} />}

      <section id="book" className="wrap scroll-mt-24 py-20 md:py-28">
        <SectionHead index="Book a call" label={form.label} meta={form.meta} className="mb-10" />
        <div className="grid gap-10 md:grid-cols-12">
          <div className="md:col-span-4">
            <h2 className="font-display text-[clamp(52px,6vw,96px)] text-ink">
              <Accent text={form.heading} />
            </h2>
          </div>
          <div className="md:col-span-7 md:col-start-6">
            <BrandForm intro={copy["site.forms"].brands} />
          </div>
        </div>
      </section>
    </>
  );
}
