import type { Metadata } from "next";
import Link from "next/link";
import BrandForm from "@/components/forms/BrandForm";
import Clients from "@/components/home/Clients";
import Infographic from "@/components/home/Infographic";
import Services from "@/components/home/Services";
import { ExpectCards, InstagramGrid, Quote } from "@/components/sections/Blocks";
import { Mark, SectionHead } from "@/components/site/Editorial";
import { FadeUp, RiseLines } from "@/components/site/Reveal";
import { AGENCY_INTRO, SERVICE_COPY } from "@/lib/content";
import { getSiteContent } from "@/lib/backend";

export const metadata: Metadata = { title: "For brands" };

export default async function ForBrands() {
  const { images } = await getSiteContent();
  return (
    <>
      <section className="wrap pt-28 md:pt-36">
        <SectionHead index="For brands" label="Your external PR team" meta="Influencer · UGC · Events · Funding" />
      </section>
      <section className="wrap grid gap-12 pb-16 pt-6 md:grid-cols-12 md:pb-24">
        <div className="md:col-span-7">
          <RiseLines
            as="h1"
            immediate
            delay={0.15}
            className="font-display text-[clamp(84px,12.5vw,210px)] leading-[0.84] text-ink"
            lines={[
              "Let's work",
              <Mark key="t" kind="underline" delay={1.2}>
                <span className="font-serif italic">together.</span>
              </Mark>,
            ]}
          />
          <FadeUp delay={0.35} className="mt-8 max-w-xl">
            <p className="text-[clamp(17px,1.4vw,20px)] leading-relaxed text-ink-2">{AGENCY_INTRO}</p>
            <Link href="/get-in-touch?form=brands" className="btn mt-8">
              Book a call <span className="arrow">→</span>
            </Link>
          </FadeUp>
        </div>
        <FadeUp delay={0.3} className="md:col-span-4 md:col-start-9 md:pt-4">
          <InstagramGrid posts={images["brands.instagram"]} />
        </FadeUp>
      </section>

      <Services services={SERVICE_COPY} showQuote={false} />

      <section className="wrap py-20 md:py-28">
        <SectionHead index="✶" label="Our approach" className="mb-10" />
        <FadeUp>
          <Quote className="max-w-5xl" />
        </FadeUp>
      </section>

      <ExpectCards cta={{ label: "Book a call", href: "#book" }} />

      <Infographic />

      <Clients logos={images["home.clients"]} />

      <section id="book" className="wrap scroll-mt-24 py-20 md:py-28">
        <SectionHead index="Book a call" label="Enquiry form" meta="We reply by email" className="mb-10" />
        <div className="grid gap-10 md:grid-cols-12">
        <div className="md:col-span-4">
          <h2 className="font-display text-[clamp(52px,6vw,96px)] text-ink">
            Tell us about <span className="font-serif italic">your brand.</span>
          </h2>
        </div>
        <div className="md:col-span-7 md:col-start-6">
          <BrandForm />
        </div>
        </div>
      </section>
    </>
  );
}
