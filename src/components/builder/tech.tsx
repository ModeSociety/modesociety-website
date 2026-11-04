/**
 * ModeSociety Tech's designed sections, as page-builder blocks. Each draws exactly what its page
 * drew before; the logos and the character select stay off the landing page until launch.
 */
import Link from "next/link";
import IntroVideo from "@/components/site/IntroVideo";
import { FadeUp } from "@/components/site/Reveal";
import SocialLinks from "@/components/site/SocialLinks";
import CharacterSelect from "@/components/tech/CharacterSelect";
import CountUp from "@/components/tech/CountUp";
import Lede from "@/components/tech/Lede";
import PageHead from "@/components/tech/PageHead";
import Process from "@/components/tech/Process";
import RosterCard from "@/components/tech/RosterCard";
import RosterGrid from "@/components/tech/RosterGrid";
import { Categories, Formats, Policy, TechFaq, TechLogos } from "@/components/tech/Sections";
import TechForms from "@/components/tech/TechForms";
import TechHero from "@/components/tech/TechHero";
import { Beams, Eyebrow, SampleTag, SectionTitle } from "@/components/tech/ui";
import { compact, rosterFor, totalFollowers } from "@/lib/tech";
import { embedFor } from "@/lib/video";
import { countText } from "@/lib/count";
import type { Ctx, Feature } from "./types";

const filmShows = ({ c }: Ctx) => !c.copy["techHome.intro"].hidden && Boolean(embedFor(c.copy["techHome.intro"].videoUrl) || c.images["tech.intro"]?.[0]);

export const TECH: Record<string, Feature> = {
  // ---------------------------------------------------------------- home
  "x.hero": { render: ({ c, landing }) => <TechHero landing={landing} text={c.copy["techHome.hero"]} /> },

  // with its title on the home page; on its own (in a panel) elsewhere
  "x.intro": {
    shows: filmShows,
    render: ({ c, page }) => {
      const intro = c.copy["techHome.intro"];
      const film = c.images["tech.intro"]?.[0];
      return page === "techBrands" ? (
        <section className="wrap pb-20 md:pb-28">
          <FadeUp className="t-panel overflow-hidden p-2">
            <IntroVideo media={film} url={intro.videoUrl} label="An introduction to ModeSociety Tech" className="rounded-[18px]" buttonClassName="bg-white text-[#0b1438]" />
          </FadeUp>
        </section>
      ) : (
        <section className="wrap pt-20 md:pt-28" aria-label="Intro film">
          <SectionTitle eyebrow={intro.eyebrow} title={intro.heading} className="mb-10" />
          <FadeUp className="t-panel p-2">
            <IntroVideo media={film} url={intro.videoUrl} label="An introduction to ModeSociety Tech" className="rounded-[18px]" buttonClassName="bg-white text-[#0b1438]" />
          </FadeUp>
        </section>
      );
    },
  },

  "x.who": {
    shows: ({ c }) => !c.copy["techHome.who"].hidden,
    render: ({ c }) => {
      const who = c.copy["techHome.who"];
      return (
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
            <Categories items={c.copy["tech.categories"].items} />
          </div>
        </section>
      );
    },
  },

  "x.logos": {
    shows: ({ c, landing }) => !landing && !c.copy["tech.logos"].hidden,
    render: ({ c }) => <TechLogos logos={c.images["tech.clients"] ?? []} copy={c.copy["tech.logos"]} />,
  },

  "x.talent": {
    shows: ({ c, landing }) => !landing && !c.copy["techHome.talent"].hidden,
    render: ({ c }) => {
      const talent = c.copy["techHome.talent"];
      const { members, sample } = rosterFor(c.roster);
      // featured first, topped up with the rest so the select screen has a full grid
      const featured = [...members.filter((m) => m.featured), ...members.filter((m) => !m.featured)].slice(0, 8);
      return (
        <section className="wrap py-20 md:py-28">
          <div className="mb-10 flex flex-wrap items-end justify-between gap-6">
            <SectionTitle eyebrow={talent.eyebrow} title={talent.heading} lead={talent.lead} />
            <div className="flex items-center gap-4">
              {sample && (
                <span className="flex items-center gap-2 text-[13px] text-t3">
                  <SampleTag /> {c.copy["tech.words"].sampleNote}
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
      );
    },
  },

  "x.run": {
    shows: ({ c }) => !c.copy["techHome.run"].hidden,
    render: ({ c }) => {
      const run = c.copy["techHome.run"];
      return (
        <section className="wrap pb-20 md:pb-28">
          <SectionTitle title={run.heading} lead={run.lead} className="mb-10" />
          <Formats items={c.copy["tech.formats"].items} words={c.copy["tech.words"]} />
        </section>
      );
    },
  },

  "x.policy": { shows: ({ c }) => !c.copy["tech.policy"].hidden, render: ({ c }) => <Policy copy={c.copy["tech.policy"]} /> },

  // before launch, both enquiry forms live on the landing page
  "x.landingForms": {
    shows: ({ landing }) => landing,
    render: ({ c }) => {
      const contact = c.copy["techHome.contact"];
      return (
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
      );
    },
  },

  "x.faqHome": {
    shows: ({ c }) => !c.copy["tech.faq"].hidden,
    render: ({ c }) => {
      const faq = c.copy["tech.faq"];
      return (
        <TechFaq
          heading={faq.heading}
          lead={faq.lead}
          groups={[
            { label: c.copy["tech.words"].faqBrands, items: faq.brands.slice(0, 3) },
            { label: c.copy["tech.words"].faqCreators, items: faq.creators.slice(0, 3) },
          ]}
        />
      );
    },
  },

  // ---------------------------------------------------------------- for brands
  "x.brandsHead": {
    render: ({ c }) => {
      const hero = c.copy["techBrands.hero"];
      return (
        <PageHead eyebrow={hero.eyebrow} title={hero.heading} ghost={hero.ghost} lead={hero.lead}>
          {hero.button && (
            <Link href="/tech/contact?as=brand" className="btn">
              {hero.button} <span className="arrow">→</span>
            </Link>
          )}
        </PageHead>
      );
    },
  },

  "x.numbers": {
    render: ({ c }) => {
      const followers = c.roster.reduce((s, m) => s + totalFollowers(m), 0);
      // only real numbers: roster followers, and what the team enters in the admin panel
      const stats = [
        followers ? { value: followers as number | string, label: c.copy["tech.words"].statFollowers } : null,
        c.techStats.views ? { value: c.techStats.views, label: c.copy["tech.words"].statViews } : null,
        c.techStats.campaigns ? { value: c.techStats.campaigns, label: c.copy["tech.words"].statCampaigns } : null,
      ].filter(Boolean) as { value: number | string; label: string }[];
      return (
        <section className="wrap pb-16 md:pb-24">
          {stats.length ? (
            <div className={`grid gap-3 ${stats.length === 3 ? "md:grid-cols-3" : stats.length === 2 ? "md:grid-cols-2" : ""}`}>
              {stats.map((s) => (
                <FadeUp key={s.label} className="t-panel p-8">
                  <span className="tech-wide block text-[clamp(48px,6vw,88px)] text-taccent">
                    <CountUp value={s.value} />
                  </span>
                  <span className="tech-mono mt-3 block text-[11px] uppercase text-t2">{s.label}</span>
                </FadeUp>
              ))}
            </div>
          ) : (
            <p className="t-panel p-8 text-[15px] text-t2">{c.copy["tech.words"].statsEmpty}</p>
          )}
        </section>
      );
    },
  },

  "x.process": {
    shows: ({ c }) => !c.copy["techBrands.process"].hidden,
    render: ({ c }) => {
      const process = c.copy["techBrands.process"];
      return (
        <section className="wrap py-20 md:py-28">
          <SectionTitle eyebrow={process.eyebrow} title={process.heading} className="mb-14" />
          <Process steps={process.steps.filter((s) => s.title.trim())} />
        </section>
      );
    },
  },

  "x.brandsRun": {
    shows: ({ c }) => !c.copy["techBrands.run"].hidden,
    render: ({ c }) => {
      const run = c.copy["techBrands.run"];
      return (
        <section className="wrap py-20 md:py-28">
          <SectionTitle title={run.heading} lead={run.lead} className="mb-10" />
          <Formats items={c.copy["tech.formats"].items} words={c.copy["tech.words"]} />
          <div className="mt-16">
            {run.categoriesTitle && <SectionTitle title={run.categoriesTitle} className="mb-8" />}
            <Categories items={c.copy["tech.categories"].items} />
          </div>
        </section>
      );
    },
  },

  "x.faqBrands": {
    shows: ({ c }) => !c.copy["tech.faq"].hidden,
    render: ({ c }) => {
      const faq = c.copy["tech.faq"];
      return <TechFaq heading={faq.heading} lead={faq.lead} groups={[{ label: c.copy["tech.words"].faqBrands, items: faq.brands }]} />;
    },
  },

  // ---------------------------------------------------------------- for creators
  "x.creatorsHead": {
    render: ({ c }) => {
      const hero = c.copy["techCreators.hero"];
      return (
        <PageHead eyebrow={hero.eyebrow} title={hero.heading} ghost={hero.ghost} lead={hero.lead}>
          {hero.button && (
            <Link href="/tech/contact?as=creator" className="btn">
              {hero.button} <span className="arrow">→</span>
            </Link>
          )}
        </PageHead>
      );
    },
  },

  "x.forYou": {
    shows: ({ c }) => !c.copy["techCreators.forYou"].hidden,
    render: ({ c }) => {
      const forYou = c.copy["techCreators.forYou"];
      return (
        <section className="wrap pb-20 md:pb-28">
          <SectionTitle title={forYou.heading} className="mb-10" />
          <div className="grid gap-3 md:grid-cols-2">
            {forYou.items
              .filter((card) => card.title.trim())
              .map((card, i) => (
                <FadeUp key={`${card.title}-${i}`} delay={(i % 2) * 0.06} className="t-panel t-foil flex min-h-[220px] flex-col justify-between p-8">
                  <span className="tech-mono text-[11px] text-taccent">0{i + 1}</span>
                  <div>
                    <h3 className="tech-display text-[clamp(32px,3vw,46px)] text-t">{card.title}</h3>
                    <p className="mt-3 max-w-lg text-[15.5px] leading-relaxed text-t2">{card.body}</p>
                  </div>
                </FadeUp>
              ))}
          </div>
        </section>
      );
    },
  },

  // creator examples / testimonials
  "x.examples": {
    shows: ({ c }) => !c.copy["techCreators.examples"].hidden,
    render: ({ c }) => {
      const ex = c.copy["techCreators.examples"];
      const { members, sample } = rosterFor(c.roster);
      const quotes = c.roster.filter((m) => m.quote);
      const examples = (members.filter((m) => m.featured).length ? members.filter((m) => m.featured) : members).slice(0, 4);
      return (
        <section className="wrap py-20 md:py-28">
          <div className="mb-10 flex flex-wrap items-end justify-between gap-6">
            <SectionTitle eyebrow={ex.eyebrow} title={ex.heading} />
            {sample && (
              <span className="flex items-center gap-2 text-[13px] text-t3">
                <SampleTag /> {c.copy["tech.words"].sampleNote}
              </span>
            )}
          </div>
          {quotes.length > 0 && (
            <div className="mb-10 grid gap-3 md:grid-cols-2">
              {quotes.slice(0, 4).map((m) => (
                <FadeUp key={m.id} className="t-panel p-8">
                  <blockquote className="text-[clamp(19px,1.7vw,24px)] leading-snug text-t">&ldquo;{m.quote}&rdquo;</blockquote>
                  <p className="tech-mono mt-6 text-[11px] uppercase text-taccent">
                    {m.name}
                    {m.handle ? ` · @${m.handle}` : ""}
                  </p>
                </FadeUp>
              ))}
            </div>
          )}
          <ul className="grid grid-cols-2 gap-3 lg:grid-cols-4">
            {examples.map((m) => (
              <li key={m.id}>
                <RosterCard m={m} sample={sample} compactLayout />
              </li>
            ))}
          </ul>
        </section>
      );
    },
  },

  "x.join": {
    shows: ({ c }) => !c.copy["techCreators.join"].hidden,
    render: ({ c }) => {
      const join = c.copy["techCreators.join"];
      return (
        <section className="wrap py-20 md:py-28">
          <div className="t-panel relative overflow-hidden p-8 md:p-14">
            <Beams />
            <div className="relative grid gap-10 md:grid-cols-2 md:items-end">
              <div>
                <h2 className="tech-wide text-[clamp(40px,5.6vw,84px)] text-t">{join.heading}</h2>
                {join.body && <p className="mt-5 max-w-md text-[16px] text-t2">{join.body}</p>}
              </div>
              <div className="flex flex-wrap gap-3 md:justify-end">
                {join.button && (
                  <Link href="/tech/contact?as=creator" className="btn">
                    {join.button} <span className="arrow">→</span>
                  </Link>
                )}
                {join.secondButton && (
                  <Link href="/tech/talent" className="btn ghost">
                    {join.secondButton}
                  </Link>
                )}
              </div>
            </div>
          </div>
        </section>
      );
    },
  },

  "x.faqCreators": {
    shows: ({ c }) => !c.copy["tech.faq"].hidden,
    render: ({ c }) => {
      const faq = c.copy["tech.faq"];
      return <TechFaq heading={faq.heading} lead={faq.lead} groups={[{ label: c.copy["tech.words"].faqCreators, items: faq.creators }]} />;
    },
  },

  // ---------------------------------------------------------------- our talent
  "x.talentHead": {
    render: ({ c }) => {
      const hero = c.copy["techTalent.hero"];
      const { members, sample } = rosterFor(c.roster);
      const total = members.reduce((s, m) => s + totalFollowers(m), 0);
      return (
        <PageHead eyebrow={hero.eyebrow} title={hero.heading} ghost={hero.ghost} lead={hero.lead}>
          <div className="flex flex-wrap items-center gap-6 text-[14px] text-t2">
            <span>
              <span className="tech-display text-[28px] text-t">{members.length}</span> {countText(c.copy["tech.words"].creatorCount, members.length)}
            </span>
            {total > 0 && (
              <span>
                <span className="tech-display text-[28px] text-t">{compact(total)}</span> {c.copy["tech.words"].followersNote}
              </span>
            )}
            {sample && (
              <span className="flex items-center gap-2">
                <SampleTag /> {c.copy["tech.words"].sampleNote}
              </span>
            )}
          </div>
        </PageHead>
      );
    },
  },

  "x.roster": {
    render: ({ c }) => {
      const { members, sample } = rosterFor(c.roster);
      return (
        <section className="wrap pb-24 md:pb-32">
          <RosterGrid members={members} sample={sample} />
          <div className="mt-12 flex flex-wrap items-center justify-between gap-4 border-t border-tline pt-8">
            <p className="text-[15px] text-t2">{c.copy["techTalent.hero"].cta}</p>
            <div className="flex flex-wrap gap-3">
              <Link href="/tech/contact?as=brand" className="btn">
                {c.copy["tech.words"].brandEnquiry}
              </Link>
              <Link href="/tech/contact?as=creator" className="btn ghost">
                {c.copy["tech.words"].applyToSign}
              </Link>
            </div>
          </div>
        </section>
      );
    },
  },

  // ---------------------------------------------------------------- contact
  "x.contactHead": {
    render: ({ c }) => {
      const hero = c.copy["techContact.hero"];
      return <PageHead eyebrow={hero.eyebrow} title={hero.heading} lead={hero.lead} ghost={hero.ghost} />;
    },
  },

  "x.contactForms": {
    render: ({ c, q }) => {
      const as = q.as === "creator" ? "creator" : "brand";
      const hero = c.copy["techContact.hero"];
      return (
        <section className="wrap grid gap-12 pb-24 md:pb-32 lg:grid-cols-12">
          <div className="lg:col-span-8">
            <TechForms key={as} initial={as} />
          </div>
          <aside className="lg:col-span-3 lg:col-start-10">
            <div className="t-panel p-6">
              <Eyebrow>{hero.asideLabel}</Eyebrow>
              <SocialLinks className="mt-4 text-t" />
              {hero.asideText && <p className="mt-6 text-[14px] leading-relaxed text-t2">{hero.asideText}</p>}
            </div>
          </aside>
        </section>
      );
    },
  },
};
