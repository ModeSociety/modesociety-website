import type { Metadata } from "next";
import Link from "next/link";
import BrandForm from "@/components/forms/BrandForm";
import Clients from "@/components/home/Clients";
import Infographic from "@/components/home/Infographic";
import Services from "@/components/home/Services";
import { ExpectCards, InstagramGrid, Quote } from "@/components/sections/Blocks";
import { FadeUp, RiseLines } from "@/components/site/Reveal";
import { AGENCY_INTRO, SERVICE_COPY } from "@/lib/content";
import { getSiteContent } from "@/lib/backend";

export const metadata: Metadata = { title: "For brands" };

export default async function ForBrands() {
  const { images } = await getSiteContent();
  return (
    <>
      <section className="wrap grid gap-12 pb-16 pt-32 md:grid-cols-12 md:pb-24 md:pt-40">
        <div className="md:col-span-6">
          <p className="eyebrow">For brands</p>
          <RiseLines
            as="h1"
            immediate
            delay={0.15}
            className="font-display mt-5 text-[clamp(38px,5.6vw,88px)]"
            lines={["Let's work", <span key="t" className="font-serif italic tracking-normal">together.</span>]}
          />
          <FadeUp delay={0.35} className="mt-8 max-w-xl">
            <p className="text-[clamp(17px,1.4vw,20px)] leading-relaxed text-ink-2">{AGENCY_INTRO}</p>
            <Link href="/get-in-touch?form=brands" className="btn mt-8">
              Book a call <span className="arrow">→</span>
            </Link>
          </FadeUp>
        </div>
        <FadeUp delay={0.3} className="md:col-span-5 md:col-start-8">
          <InstagramGrid posts={images["brands.instagram"]} />
        </FadeUp>
      </section>

      <Services services={SERVICE_COPY} showQuote={false} />

      <section className="wrap py-20 md:py-28">
        <FadeUp>
          <Quote className="max-w-5xl" />
        </FadeUp>
      </section>

      <ExpectCards cta={{ label: "Book a call", href: "#book" }} />

      <Infographic />

      <Clients logos={images["home.clients"]} />

      <section id="book" className="wrap grid scroll-mt-24 gap-10 py-20 md:grid-cols-12 md:py-28">
        <div className="md:col-span-4">
          <p className="eyebrow">Book a call</p>
          <h2 className="font-display mt-4 text-[clamp(30px,3.8vw,56px)]">
            Tell us about <span className="font-serif italic tracking-normal">your brand.</span>
          </h2>
        </div>
        <div className="md:col-span-7 md:col-start-6">
          <BrandForm />
        </div>
      </section>
    </>
  );
}
