import type { Metadata } from "next";
import Link from "next/link";
import Clients from "@/components/home/Clients";
import { PressList, PressLogos } from "@/components/press/Press";
import { SectionHead } from "@/components/site/Editorial";
import { FadeUp, RiseLines } from "@/components/site/Reveal";
import { PRESS } from "@/lib/content";
import { getSiteContent } from "@/lib/backend";

export const metadata: Metadata = { title: "Featured in", description: "Press and media features of Mode Society." };

export default async function FeaturedIn() {
  const { images } = await getSiteContent();
  const logos = images["press.logos"] ?? [];
  const empty = !logos.length && !PRESS.length;

  return (
    <>
      <section className="wrap overflow-hidden pb-12 pt-28 md:pb-16 md:pt-36">
        <SectionHead index="Press" label="Featured in" meta="Media & press" />
        <div className="relative mt-4">
          {/* the out-of-focus word behind the headline */}
          <p
            aria-hidden
            className="blur-type font-display pointer-events-none absolute -top-[0.04em] left-[-0.03em] select-none text-[clamp(150px,30vw,520px)] leading-[0.8] text-red/70"
          >
            Press
          </p>
          <RiseLines
            as="h1"
            immediate
            delay={0.1}
            className="font-display relative text-[clamp(62px,15vw,260px)] leading-[0.84] text-ink"
            lines={[<span key="l">Featured <span className="font-serif italic">in.</span></span>]}
          />
        </div>
      </section>

      {logos.length > 0 && (
        <section className="wrap pb-16 md:pb-24">
          <FadeUp>
            <PressLogos logos={logos} />
          </FadeUp>
        </section>
      )}

      {PRESS.length > 0 && (
        <section className="wrap pb-20 md:pb-28">
          <SectionHead index="01" label="Articles" meta={`${PRESS.length} features`} className="mb-2" />
          <PressList />
        </section>
      )}

      {empty && (
        <section className="wrap pb-8">
          <FadeUp className="grid gap-8 border-t border-espresso/15 pt-8 md:grid-cols-12">
            <p className="font-serif text-[clamp(26px,3vw,44px)] leading-[1.15] text-ink md:col-span-8">
              Our press page is on its way. In the meantime, here are some of the brands our creators have worked with.
            </p>
            <div className="md:col-span-3 md:col-start-10 md:self-end md:justify-self-end">
              <Link href="/get-in-touch" className="btn">
                Press enquiries <span className="arrow">↗</span>
              </Link>
            </div>
          </FadeUp>
        </section>
      )}

      <Clients logos={images["home.clients"]} />
    </>
  );
}
