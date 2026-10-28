import type { Metadata } from "next";
import Link from "next/link";
import Lede from "@/components/tech/Lede";
import CharacterSelect from "@/components/tech/CharacterSelect";
import { Categories, Formats, Policy, TechFaq, TechLogos } from "@/components/tech/Sections";
import TechForms from "@/components/tech/TechForms";
import TechHero from "@/components/tech/TechHero";
import { SampleTag, SectionTitle } from "@/components/tech/ui";
import IntroVideo from "@/components/site/IntroVideo";
import { FadeUp } from "@/components/site/Reveal";
import { getSiteContent } from "@/lib/backend";
import { pageMetadata } from "@/lib/seo";
import { rosterFor, TECH_CONTACT_LINE, TECH_FAQ_BRANDS, TECH_FAQ_CREATORS, TECH_WHO } from "@/lib/tech";
import { techMode } from "@/lib/techMode";

export const metadata: Metadata = pageMetadata("techHome");

/**
 * The Tech home page. Before launch it is the whole public site (`landing`): the hero, the
 * intro film, who we are, what we run, the 18+ policy, both enquiry forms and the FAQ, with
 * no links to the pages still being built. After launch it adds the logos and the roster.
 */
export default async function TechHome() {
  const { images, roster } = await getSiteContent();
  const { landing } = await techMode();
  const { members, sample } = rosterFor(roster);
  // featured first, topped up with the rest so the select screen has a full grid
  const featured = [...members.filter((m) => m.featured), ...members.filter((m) => !m.featured)].slice(0, 8);
  const intro = images["tech.intro"]?.[0];

  return (
    <>
      <TechHero landing={landing} />

      {intro && (
        <section className="wrap pt-20 md:pt-28" aria-label="Meet ModeSociety Tech">
          <SectionTitle eyebrow="Watch" title="Meet ModeSociety Tech." className="mb-10" />
          <FadeUp className="t-panel p-2">
            <IntroVideo media={intro} label="An introduction to ModeSociety Tech" className="rounded-[18px]" buttonClassName="bg-white text-[#0b1438]" />
          </FadeUp>
        </section>
      )}

      {/* Who are we? */}
      <section className="wrap py-20 md:py-28">
        <div className="grid gap-10 lg:grid-cols-12">
          <p className="tech-mono text-[11px] uppercase text-t3 lg:col-span-3">Who are we?</p>
          <div className="lg:col-span-9">
            <Lede text={TECH_WHO.lead} className="text-[clamp(26px,3.1vw,46px)] font-medium leading-[1.18] tracking-[-0.01em]" />
            <FadeUp className="mt-8 max-w-2xl">
              <p className="text-[clamp(16px,1.3vw,19px)] leading-relaxed text-t2">{TECH_WHO.body}</p>
            </FadeUp>
          </div>
        </div>
        <div className="mt-16">
          <SectionTitle title="Who we run campaigns for." className="mb-8" />
          <Categories />
        </div>
      </section>

      {!landing && <TechLogos logos={images["tech.clients"] ?? []} />}

      {/* Our talent */}
      {!landing && (
        <section className="wrap py-20 md:py-28">
          <div className="mb-10 flex flex-wrap items-end justify-between gap-6">
            <SectionTitle eyebrow="Our talent" title="Choose your creator." lead="Streamers, content creators and esports athletes across gaming and tech. Quality over volume." />
            <div className="flex items-center gap-4">
              {sample && (
                <span className="flex items-center gap-2 text-[13px] text-t3">
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
      )}

      {/* What we run */}
      <section className="wrap pb-20 md:pb-28">
        <SectionTitle title="What we run." lead="For gaming gear and peripheral brands, energy drinks and snacks, tech and telco, and game publishers." className="mb-10" />
        <Formats />
      </section>

      <Policy />

      {/* before launch, both enquiry forms live here */}
      {landing && (
        <section id="contact" className="relative scroll-mt-20 overflow-hidden py-20 md:py-28">
          <span id="enquire" className="absolute top-0 scroll-mt-20" />
          <span id="apply" className="absolute top-0 scroll-mt-20" />
          <div aria-hidden className="t-aura -left-[10%] top-[10%] h-[60%] w-[50%]" />
          <div className="wrap relative grid gap-12 lg:grid-cols-12">
            <div className="lg:col-span-4">
              <SectionTitle eyebrow="Get in touch" title="Two ways in." lead={TECH_CONTACT_LINE} />
            </div>
            <div className="t-panel p-6 md:p-10 lg:col-span-8">
              <TechForms onPage />
            </div>
          </div>
        </section>
      )}

      <TechFaq
        groups={[
          { label: "For brands", items: TECH_FAQ_BRANDS.slice(0, 3) },
          { label: "For creators", items: TECH_FAQ_CREATORS.slice(0, 3) },
        ]}
      />
    </>
  );
}
