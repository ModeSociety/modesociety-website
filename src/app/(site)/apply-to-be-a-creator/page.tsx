import type { Metadata } from "next";
import JsonLd from "@/components/site/JsonLd";
import { breadcrumbJsonLd, pageMetadata } from "@/lib/seo";
import Link from "next/link";
import { StrikeList } from "@/components/about/AboutFx";
import TalentForm from "@/components/forms/TalentForm";
import Clients from "@/components/home/Clients";
import { Steps } from "@/components/sections/Blocks";
import { SectionHead } from "@/components/site/Editorial";
import { FadeUp, RiseLines, ScrubText } from "@/components/site/Reveal";
import Faq from "@/components/sections/Faq";
import { TALENT, TALENT_FAQ } from "@/lib/content";
import { getSiteContent } from "@/lib/backend";

export const metadata: Metadata = pageMetadata("talent");

export default async function ForTalent() {
  const { images } = await getSiteContent();
  return (
    <>
      <JsonLd data={breadcrumbJsonLd("talent")} />
      <section className="wrap pb-16 pt-28 md:pb-24 md:pt-36">
        <SectionHead index="For talent" label="Models · influencers · UGC · streamers" meta="Applications open" />
        <RiseLines
          as="h1"
          immediate
          delay={0.15}
          className="font-display mt-6 text-[clamp(62px,14vw,240px)] leading-[0.84] text-ink"
          lines={[
            "Thinking of",
            <span key="t" className="font-serif italic">signing?</span>,
          ]}
        />
        <FadeUp delay={0.35} className="mt-8 grid gap-8 md:grid-cols-12">
          <p className="text-[clamp(17px,1.4vw,20px)] leading-relaxed text-ink-2 md:col-span-7">{TALENT.intro}</p>
          <div className="md:col-span-4 md:col-start-9 md:self-end md:justify-self-end">
            <Link href="#apply" className="btn">
              Apply now <span className="arrow">→</span>
            </Link>
          </div>
        </FadeUp>
      </section>

      <section className="wrap py-20 md:py-28">
        <SectionHead index="01" label="Why we started" meta="What creators told us" className="mb-10" />
        <div className="mb-12 grid gap-6 md:grid-cols-12">
          <h2 className="font-display text-[clamp(52px,6.4vw,104px)] text-ink md:col-span-7">
            Why we started <span className="font-serif italic">Mode Society.</span>
          </h2>
          <p className="max-w-xl text-lg text-ink-2 md:col-span-4 md:col-start-9 md:self-end">
            Traditional representation left too many creators frustrated. So we built the agency we wished we&apos;d had.
          </p>
        </div>
        <StrikeList items={TALENT.frustrations} />
      </section>

      <section className="wrap py-20 md:py-28">
        <SectionHead index="02" label="What you can expect" className="mb-10" />
        <h2 className="font-display text-[clamp(52px,6.4vw,104px)] text-ink">
          What you can expect <span className="font-serif italic">from us.</span>
        </h2>
        <ScrubText className="font-serif mt-10 max-w-5xl text-[clamp(24px,3vw,44px)] leading-[1.15]" text={TALENT.created} />
        <SectionHead label="From signing to getting paid" meta="4 steps" className="mb-5 mt-16" />
        <Steps steps={TALENT.journey} />
      </section>

      <section className="wrap py-20 md:py-28">
        <SectionHead index="03" label="What we do for you" meta={`${TALENT.forYou.length} included`} className="mb-10" />
        <div className="grid gap-10 md:grid-cols-12">
          <h2 className="font-display text-[clamp(52px,6vw,96px)] text-ink md:col-span-5">
            What we do <span className="font-serif italic">for you.</span>
          </h2>
          <ul className="grid gap-x-8 sm:grid-cols-2 md:col-span-7 md:col-start-6">
            {TALENT.forYou.map((t) => (
              <li key={t} className="flex items-center gap-4 border-b border-espresso/15 py-4 text-[17px]">
                <span className="grid h-6 w-6 shrink-0 place-items-center bg-ink text-[12px] text-white">✓</span>
                {t}
              </li>
            ))}
          </ul>
        </div>
      </section>

      <section className="wrap py-20 md:py-28">
        <SectionHead index="04" label="Flexible representation" className="mb-10" />
        <h2 className="font-display text-[clamp(52px,6.4vw,104px)] text-ink">
          Flexible <span className="font-serif italic">representation.</span>
        </h2>
        <div className="mt-10 grid gap-4 md:grid-cols-3">
          {TALENT.flexible.map((c) => (
            <FadeUp key={c.title} className="border border-espresso/15 bg-white p-7">
              <h3 className="font-display text-[clamp(32px,3vw,44px)] text-ink">{c.title}</h3>
              <p className="mt-3 text-[16px] leading-relaxed text-ink-2">{c.body}</p>
            </FadeUp>
          ))}
        </div>
      </section>

      <Clients logos={images["home.clients"]} />

      <Faq items={TALENT_FAQ} label="Questions creators ask" />

      <section id="apply" className="wrap scroll-mt-24 py-20 md:py-28">
        <SectionHead index="Apply now" label="Talent application" className="mb-10" />
        <div className="grid gap-10 md:grid-cols-12">
          <div className="md:col-span-4">
            <h2 className="font-display text-[clamp(52px,6vw,96px)] text-ink">
              Want Mode <span className="font-serif italic">to represent you?</span>
            </h2>
          </div>
          <div className="md:col-span-7 md:col-start-6">
            <TalentForm />
          </div>
        </div>
      </section>
    </>
  );
}
