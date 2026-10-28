import type { Metadata } from "next";
import Link from "next/link";
import Lede from "@/components/tech/Lede";
import CharacterSelect from "@/components/tech/CharacterSelect";
import { Categories, Formats, Policy, TechFaq, TechLogos } from "@/components/tech/Sections";
import TechForms from "@/components/tech/TechForms";
import TechHero from "@/components/tech/TechHero";
import { SampleTag, SectionTitle } from "@/components/tech/ui";
import IntroVideo from "@/components/site/IntroVideo";
import { embedFor } from "@/lib/video";
import { FadeUp } from "@/components/site/Reveal";
import { getSiteContent } from "@/lib/backend";
import { pageMetadata } from "@/lib/seo";
import { rosterFor } from "@/lib/tech";
import { techMode } from "@/lib/techMode";

export const metadata: Metadata = pageMetadata("techHome");

/**
 * The Tech home page. Before launch it is the whole public site (`landing`): the hero, the
 * intro film, who we are, what we run, the 18+ policy, both enquiry forms and the FAQ, with
 * no links to the pages still being built. After launch it adds the logos and the roster.
 */
export default async function TechHome() {
  const { images, roster, copy } = await getSiteContent();
  const { landing } = await techMode();
  const { members, sample } = rosterFor(roster);
  // featured first, topped up with the rest so the select screen has a full grid
  const featured = [...members.filter((m) => m.featured), ...members.filter((m) => !m.featured)].slice(0, 8);
  const intro = copy["techHome.intro"];
  const film = images["tech.intro"]?.[0];
  const showFilm = !intro.hidden && (embedFor(intro.videoUrl) || film);
  const who = copy["techHome.who"];
  const talent = copy["techHome.talent"];
  const run = copy["techHome.run"];
  const contact = copy["techHome.contact"];
  const faq = copy["tech.faq"];

  return (
    <>
      <TechHero landing={landing} text={copy["techHome.hero"]} />

      {showFilm && (
        <section className="wrap pt-20 md:pt-28" aria-label="Intro film">
          <SectionTitle eyebrow={intro.eyebrow} title={intro.heading} className="mb-10" />
          <FadeUp className="t-panel p-2">
            <IntroVideo media={film} url={intro.videoUrl} label="An introduction to ModeSociety Tech" className="rounded-[18px]" buttonClassName="bg-white text-[#0b1438]" />
          </FadeUp>
        </section>
      )}

      {!who.hidden && (
        <section className="wrap py-20 md:py-28">
          <div className="grid gap-10 lg:grid-cols-12">
            <p className="tech-mono text-[11px] uppercase text-t3 lg:col-span-3">{who.label}</p>
            <div className="lg:col-span-9">
              <Lede text={who.lead} className="text-[clamp(26px,3.1vw,46px)] font-medium leading-[1.18] tracking-[-0.01em]" />
              {who.body && (
                <FadeUp className="mt-8 max-w-2xl">
                  <p className="text-[clamp(16px,1.3vw,19px)] leading-relaxed text-t2">{who.body}</p>
                </FadeUp>
              )}
            </div>
          </div>
          <div className="mt-16">
            {who.categoriesTitle && <SectionTitle title={who.categoriesTitle} className="mb-8" />}
            <Categories items={copy["tech.categories"].items} />
          </div>
        </section>
      )}

      {!landing && !copy["tech.logos"].hidden && <TechLogos logos={images["tech.clients"] ?? []} copy={copy["tech.logos"]} />}

      {!landing && !talent.hidden && (
        <section className="wrap py-20 md:py-28">
          <div className="mb-10 flex flex-wrap items-end justify-between gap-6">
            <SectionTitle eyebrow={talent.eyebrow} title={talent.heading} lead={talent.lead} />
            <div className="flex items-center gap-4">
              {sample && (
                <span className="flex items-center gap-2 text-[13px] text-t3">
                  <SampleTag /> Sample cards for layout, not real creators.
                </span>
              )}
              {talent.button && (
                <Link href="/tech/talent" className="btn ghost">
                  {talent.button} <span className="arrow">→</span>
                </Link>
              )}
            </div>
          </div>
          <CharacterSelect members={featured} sample={sample} />
        </section>
      )}

      {!run.hidden && (
        <section className="wrap pb-20 md:pb-28">
          <SectionTitle title={run.heading} lead={run.lead} className="mb-10" />
          <Formats items={copy["tech.formats"].items} />
        </section>
      )}

      <Policy copy={copy["tech.policy"]} />

      {/* before launch, both enquiry forms live here */}
      {landing && (
        <section id="contact" className="relative scroll-mt-20 overflow-hidden py-20 md:py-28">
          <span id="enquire" className="absolute top-0 scroll-mt-20" />
          <span id="apply" className="absolute top-0 scroll-mt-20" />
          <div aria-hidden className="t-aura -left-[10%] top-[10%] h-[60%] w-[50%]" />
          <div className="wrap relative grid gap-12 lg:grid-cols-12">
            <div className="lg:col-span-4">
              <SectionTitle eyebrow={contact.eyebrow} title={contact.heading} lead={contact.body} />
            </div>
            <div className="t-panel p-6 md:p-10 lg:col-span-8">
              <TechForms onPage />
            </div>
          </div>
        </section>
      )}

      {!faq.hidden && (
        <TechFaq
          heading={faq.heading}
          lead={faq.lead}
          groups={[
            { label: "For brands", items: faq.brands.slice(0, 3) },
            { label: "For creators", items: faq.creators.slice(0, 3) },
          ]}
        />
      )}
    </>
  );
}
