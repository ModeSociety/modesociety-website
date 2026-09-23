import type { Metadata } from "next";
import Link from "next/link";
import { HorizontalGallery, ParallaxImage, StrikeList } from "@/components/about/AboutFx";
import { FadeUp, RiseLines, ScrubText } from "@/components/site/Reveal";
import { getSiteContent } from "@/lib/backend";

export const metadata: Metadata = { title: "About" };

export default async function About() {
  const { images } = await getSiteContent();

  return (
    <>
      <section className="wrap grid min-h-[100svh] items-end gap-10 pb-16 pt-32 md:grid-cols-12 md:pb-24">
        <div className="md:col-span-7">
          <p className="eyebrow">About Mode Society</p>
          <RiseLines
            as="h1"
            immediate
            delay={0.2}
            className="font-display mt-6 text-[clamp(34px,5.6vw,92px)]"
            lines={[
              "Founded by",
              <span key="a" className="font-serif italic tracking-normal">Asha Stonehouse,</span>,
              "a creator &",
              <>
                model <span className="font-serif italic tracking-normal">herself.</span>
              </>,
            ]}
          />
          <FadeUp delay={0.6} className="mt-8 max-w-lg text-lg text-ink-2">
            Mode Society was built from first-hand experience within the industry, by someone who has been on the talent
            side of the table.
          </FadeUp>
        </div>
        <div className="md:col-span-4 md:col-start-9">
          <ParallaxImage image={images["about.founder"]?.[0]} className="aspect-[3/4] w-full" />
          <p className="font-serif mt-3 text-sm italic text-muted">Asha Stonehouse, founder</p>
        </div>
      </section>

      <section className="wrap py-24 md:py-32">
        <div className="mb-12 grid gap-6 md:grid-cols-12">
          <p className="eyebrow md:col-span-3">(01) What we set out to fix</p>
          <p className="max-w-xl text-lg text-ink-2 md:col-span-7">
            Traditional representation left too many creators frustrated. So we built the agency we wished we&apos;d had.
          </p>
        </div>
        <StrikeList items={["Poor communication", "Lack of transparency", "Misaligned opportunities", "Slow responses"]} />
      </section>

      <section className="wrap grid gap-10 py-24 md:grid-cols-12 md:py-32">
        <p className="eyebrow md:col-span-3">(02) Why we do what we do</p>
        <div className="md:col-span-9">
          <ScrubText
            className="font-serif text-[clamp(28px,3.8vw,58px)] leading-[1.1]"
            text="Mode Society was created to offer a more personal, hands-on approach. Our talent aren't just represented; they're understood. We take care of the administration, negotiations and communication, while understanding each creator's goals, creative direction and the brands they want to work with."
          />
        </div>
      </section>

      <HorizontalGallery images={images["about.gallery"]} />

      <section className="bg-ink py-24 text-paper md:py-32">
        <div className="wrap grid gap-12 md:grid-cols-12">
          <div className="md:col-span-5">
            <p className="eyebrow !text-paper/50">(04) For brands</p>
            <h2 className="font-display mt-6 text-[clamp(30px,4.4vw,66px)]">
              The right match, <span className="font-serif italic tracking-normal">not the whole roster.</span>
            </h2>
          </div>
          <div className="grid gap-8 md:col-span-6 md:col-start-7">
            <p className="text-lg text-paper/75">
              Mode Society is an Australian boutique talent agency representing a carefully curated roster of UGC creators,
              influencers, models and creative professionals worldwide. We source through our own roster and an extended
              creator network.
            </p>
            <ul className="grid grid-cols-2 gap-x-6 gap-y-3 text-sm uppercase tracking-[0.14em] text-paper/80">
              {["Sourcing", "Outreach", "Casting", "Negotiations", "Briefing", "Communication", "Content coordination", "Deliverables"].map(
                (s) => (
                  <li key={s} className="flex items-center gap-3 border-b border-paper/10 pb-3">
                    <span className="h-1.5 w-1.5 rounded-full bg-pin" /> {s}
                  </li>
                ),
              )}
            </ul>
            <div className="flex flex-wrap gap-3">
              <Link href="/work-with-us" className="btn light">
                Work with us <span className="arrow">→</span>
              </Link>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
