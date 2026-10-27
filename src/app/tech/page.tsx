import type { Metadata } from "next";
import Link from "next/link";
import Lede from "@/components/tech/Lede";
import CharacterSelect from "@/components/tech/CharacterSelect";
import { Categories, Formats, Policy, TechFaq, TechLogos } from "@/components/tech/Sections";
import TechHero from "@/components/tech/TechHero";
import { SampleTag, SectionTitle } from "@/components/tech/ui";
import { FadeUp } from "@/components/site/Reveal";
import { getSiteContent } from "@/lib/backend";
import { pageMetadata } from "@/lib/seo";
import { rosterFor, TECH_FAQ_BRANDS, TECH_FAQ_CREATORS, TECH_WHO } from "@/lib/tech";

export const metadata: Metadata = pageMetadata("techHome");

export default async function TechHome() {
  const { images, roster } = await getSiteContent();
  const { members, sample } = rosterFor(roster);
  // featured first, topped up with the rest so the select screen has a full grid
  const featured = [...members.filter((m) => m.featured), ...members.filter((m) => !m.featured)].slice(0, 8);

  return (
    <>
      <TechHero />

      {/* Who are we? */}
      <section className="wrap py-20 md:py-28">
        <div className="grid gap-10 lg:grid-cols-12">
          <p className="tech-mono text-[11px] uppercase text-[#8c95a5] lg:col-span-3">Who are we?</p>
          <div className="lg:col-span-9">
            <Lede text={TECH_WHO.lead} className="text-[clamp(26px,3.1vw,46px)] font-medium leading-[1.18] tracking-[-0.01em]" />
            <FadeUp className="mt-8 max-w-2xl">
              <p className="text-[clamp(16px,1.3vw,19px)] leading-relaxed text-[#aab2c0]">{TECH_WHO.body}</p>
            </FadeUp>
          </div>
        </div>
        <div className="mt-16">
          <SectionTitle title="Who we run campaigns for." className="mb-8" />
          <Categories />
        </div>
      </section>

      <TechLogos logos={images["tech.clients"] ?? []} />

      {/* Our talent */}
      <section className="wrap py-20 md:py-28">
        <div className="mb-10 flex flex-wrap items-end justify-between gap-6">
          <SectionTitle eyebrow="Our talent" title="Choose your creator." lead="Streamers, content creators and esports athletes across gaming and tech. Quality over volume." />
          <div className="flex items-center gap-4">
            {sample && (
              <span className="flex items-center gap-2 text-[13px] text-[#8c95a5]">
                <SampleTag /> Sample cards for layout, not real creators.
              </span>
            )}
            <Link href="/tech/talent" className="btn ghost">
              See the full roster <span className="arrow">→</span>
            </Link>
          </div>
        </div>
        <CharacterSelect members={featured} sample={sample} />
      </section>

      {/* What we run */}
      <section className="wrap pb-20 md:pb-28">
        <SectionTitle title="What we run." lead="For gaming gear and peripheral brands, energy drinks and snacks, tech and telco, and game publishers." className="mb-10" />
        <Formats />
      </section>

      <Policy />

      <TechFaq
        groups={[
          { label: "For brands", items: TECH_FAQ_BRANDS.slice(0, 3) },
          { label: "For creators", items: TECH_FAQ_CREATORS.slice(0, 3) },
        ]}
      />
    </>
  );
}
