/**
 * Mode Society's designed sections, as page-builder blocks. Each draws exactly what its page drew
 * before; its wording comes from Pages & text and its photos from Images & video, as always.
 */
import Link from "next/link";
import { StrikeList } from "@/components/about/AboutFx";
import BrandForm from "@/components/forms/BrandForm";
import GetInTouch, { type FormKey } from "@/components/forms/GetInTouch";
import PartnerForm from "@/components/forms/PartnerForm";
import TalentForm from "@/components/forms/TalentForm";
import Clients from "@/components/home/Clients";
import DualCta from "@/components/home/DualCta";
import Hero from "@/components/home/Hero";
import Infographic from "@/components/home/Infographic";
import Services from "@/components/home/Services";
import VideoOrbit from "@/components/home/VideoOrbit";
import { FeaturedStrip, PressGrid, PressLogos } from "@/components/press/Press";
import { Accordion, ExpectCards, InstagramGrid, Quote, Steps } from "@/components/sections/Blocks";
import Faq from "@/components/sections/Faq";
import ServicesShowcase from "@/components/services/ServicesShowcase";
import Accent, { accent, headingLines } from "@/components/site/Accent";
import { Mark, SectionHead } from "@/components/site/Editorial";
import IntroVideo from "@/components/site/IntroVideo";
import { FadeUp, RiseLines, ScrubText } from "@/components/site/Reveal";
import SocialLinks from "@/components/site/SocialLinks";
import WorkMedia, { workNo } from "@/components/work/WorkMedia";
import WorkTeaser from "@/components/work/WorkTeaser";
import type { ServiceDetail, StepIcon } from "@/lib/content";
import { responsive } from "@/lib/img";
import { slugify } from "@/lib/press";
import { SLOTS } from "@/lib/slots";
import { embedFor } from "@/lib/video";
import { countText } from "@/lib/count";
import type { Feature } from "./types";

/* a loose editorial rhythm of crops down the Our work grid; videos stay portrait */
const SHAPES = ["aspect-[4/5]", "aspect-[3/4]", "aspect-square", "aspect-[4/5]", "aspect-[2/3]", "aspect-[4/5]"];
const FORM_KEYS: FormKey[] = ["talent", "brands", "partner"];

function ServiceBody({ text, label, href }: { text: string; label: string; href: string }) {
  return (
    <>
      <p>{text}</p>
      {label && href && (
        <a href={href} target="_blank" rel="noreferrer" className="mt-3 inline-block font-mono text-[12px] font-medium uppercase tracking-[0.04em] underline underline-offset-4">
          {label}
        </a>
      )}
    </>
  );
}

export const TALENT: Record<string, Feature> = {
  // ---------------------------------------------------------------- home
  "t.homeHero": { render: ({ c }) => <Hero images={c.images["home.wall"]} settings={c.settings} text={c.copy["home.hero"]} /> },

  "t.intro": {
    shows: ({ c }) => !c.copy["home.intro"].hidden && Boolean(embedFor(c.copy["home.intro"].videoUrl) || c.images["home.intro"]?.[0]),
    render: ({ c }) => {
      const intro = c.copy["home.intro"];
      return (
        <section className="wrap pt-20 md:pt-28" aria-label="Intro film">
          <SectionHead label={intro.label} meta={intro.meta} />
          <div className="mt-8 flex flex-col justify-between gap-6 md:flex-row md:items-end">
            <h2 className="font-display text-[clamp(52px,7.6vw,124px)] text-ink">
              <Accent text={intro.heading} />
            </h2>
            {intro.body && <p className="max-w-sm text-[16px] leading-relaxed text-ink-2 md:pb-3">{intro.body}</p>}
          </div>
          <FadeUp className="mt-10">
            <IntroVideo
              media={c.images["home.intro"]?.[0]}
              url={intro.videoUrl}
              label="An introduction to Mode Society"
              className="grain"
              buttonClassName="bg-paper text-ink !rounded-none font-mono !text-[11px] md:!text-[12px] uppercase tracking-[0.06em]"
            />
          </FadeUp>
        </section>
      );
    },
  },

  "t.agency": {
    shows: ({ c }) => !c.copy["home.agency"].hidden,
    render: ({ c }) => {
      const agency = c.copy["home.agency"];
      return (
        <section className="wrap py-20 md:py-28">
          <SectionHead label={agency.label} meta={agency.meta} />
          <div className="mt-10 grid items-center gap-10 md:grid-cols-12">
            <FadeUp className="md:col-span-7">
              <h2 className="font-display text-[clamp(52px,7.6vw,124px)] text-ink">
                <Accent text={agency.heading} />
              </h2>
              {agency.body && <p className="mt-8 max-w-xl text-[clamp(17px,1.4vw,20px)] leading-[1.6] text-ink-2">{agency.body}</p>}
              {agency.button && (
                <Link href="/about" className="btn mt-9">
                  {agency.button} <span className="arrow">→</span>
                </Link>
              )}
            </FadeUp>
            <div className="md:col-span-5">
              <VideoOrbit items={c.images["home.videos"]} />
            </div>
          </div>
        </section>
      );
    },
  },

  // the pull quote sits inside the services only on the home page
  "t.services": { render: ({ c, page }) => <Services copy={c.copy["site.services"]} quote={page === "home" ? c.copy["site.quote"].quote : undefined} /> },

  "t.work": {
    shows: ({ c }) => !c.copy["home.work"].hidden && (c.images["work.gallery"]?.length ?? 0) > 0,
    render: ({ c }) => <WorkTeaser items={c.images["work.gallery"] ?? []} copy={c.copy["home.work"]} />,
  },

  "t.clients": {
    shows: ({ c }) => !c.copy["site.clients"].hidden && (c.images["home.clients"]?.length ?? 0) > 0,
    render: ({ c }) => <Clients logos={c.images["home.clients"]} copy={c.copy["site.clients"]} />,
  },

  "t.press": {
    shows: ({ c }) => !c.copy["home.press"].hidden && ((c.images["press.logos"]?.length ?? 0) > 0 || c.press.length > 0),
    render: ({ c }) => <FeaturedStrip logos={c.images["press.logos"] ?? []} items={c.press} copy={c.copy["home.press"]} />,
  },

  "t.cta": {
    shows: ({ c }) => !c.copy["site.cta"].hidden,
    render: ({ c }) => (
      <DualCta style={c.settings.ctaStyle} brands={c.images["contact.brands"]?.[0]} talent={c.images["contact.talent"]?.[0]} copy={c.copy["site.cta"]} />
    ),
  },

  "t.numbers": {
    shows: ({ c }) => !c.copy["site.numbers"].hidden,
    render: ({ c }) => <Infographic copy={c.copy["site.numbers"]} />,
  },

  // ---------------------------------------------------------------- about
  "t.aboutHero": {
    render: ({ c }) => {
      const hero = c.copy["about.hero"];
      return (
        <section className="wrap pt-28 md:pt-36">
          <SectionHead index={hero.tag} label={hero.label} meta={hero.meta} />
          <RiseLines as="h1" immediate delay={0.1} className="font-display mt-6 text-[clamp(62px,15vw,250px)] leading-[0.84] text-ink" lines={headingLines(hero.heading)} />
        </section>
      );
    },
  },

  "t.aboutStory": {
    render: ({ c }) => {
      const team = c.images["about.team"]?.[0];
      const story = c.copy["about.story"];
      const paragraphs = story.story.split(/\n\s*\n/).map((p) => p.trim()).filter(Boolean);
      const dropdowns = [
        ...(paragraphs.length
          ? [
              {
                title: story.storyTitle,
                body: (
                  <>
                    {paragraphs.map((p, i) => (
                      <p key={i} className={i ? "mt-4" : ""}>
                        {p}
                      </p>
                    ))}
                  </>
                ),
              },
            ]
          : []),
        ...(story.list.length
          ? [
              {
                title: story.listTitle,
                body: (
                  <ul className="grid gap-3">
                    {story.list.map((w, i) => (
                      <li key={`${w}-${i}`} className="flex gap-3">
                        <span className="mt-[9px] h-1.5 w-1.5 shrink-0 rounded-full bg-ink" /> {w}
                      </li>
                    ))}
                  </ul>
                ),
              },
            ]
          : []),
      ];
      return (
        <section className="wrap grid gap-12 pb-20 pt-12 md:grid-cols-12 md:pb-28 md:pt-16">
          <div className="md:col-span-7">
            <FadeUp>
              <Quote text={c.copy["site.quote"].quote} />
            </FadeUp>
            {dropdowns.length > 0 && (
              <div className="mt-12">
                <Accordion defaultOpen={0} items={dropdowns} />
              </div>
            )}
          </div>
          <div className="md:col-span-4 md:col-start-9 md:pt-10">
            <FadeUp>
              {team ? (
                <div className="grain">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img {...responsive(team.src, "(max-width: 767px) 100vw, 33vw", 1200)} alt={team.alt || "The Mode Society team"} className="w-full object-cover" />
                </div>
              ) : (
                <div className="grid aspect-[4/3] w-full place-items-center border border-dashed border-line text-center text-sm text-muted">
                  Team photo: add it to the Drive folder &ldquo;About Us 1&rdquo;
                </div>
              )}
              {story.caption && (
                <p className="mt-3 font-mono text-[11px] font-medium uppercase leading-relaxed tracking-[0.04em] text-muted">
                  {story.figLabel && <span className="text-ink">{story.figLabel} — </span>}
                  {story.caption}
                </p>
              )}
            </FadeUp>
          </div>
        </section>
      );
    },
  },

  "t.aboutServices": {
    shows: ({ c }) => !c.copy["about.services"].hidden,
    render: ({ c }) => {
      const what = c.copy["about.services"];
      const services = c.copy["site.services"].items.filter((s) => s.title.trim());
      return (
        <section className="wrap py-20 md:py-28">
          <SectionHead label={what.label} meta={what.meta} className="mb-10" />
          <div className="grid items-center gap-10 md:grid-cols-12">
            <div className="md:col-span-6">
              <h2 className="font-display text-[clamp(52px,6.6vw,108px)] text-ink">
                <Accent text={what.heading} />
              </h2>
              <div className="mt-10">
                <Accordion items={services.map((s) => ({ title: s.title, body: <ServiceBody text={s.body} label={s.linkLabel} href={s.linkUrl} /> }))} />
              </div>
            </div>
            <div className="md:col-span-5 md:col-start-8">
              <VideoOrbit items={c.images["home.videos"]} />
            </div>
          </div>
        </section>
      );
    },
  },

  // on the For brands page its button goes to the form further down
  "t.expect": {
    shows: ({ c }) => !c.copy["site.expect"].hidden,
    render: ({ c, has }) => <ExpectCards copy={c.copy["site.expect"]} href={has("t.brandsForm") ? "#book" : undefined} />,
  },

  // ---------------------------------------------------------------- for brands
  "t.brandsHero": {
    render: ({ c }) => {
      const hero = c.copy["brands.hero"];
      return (
        <>
          <section className="wrap pt-28 md:pt-36">
            <SectionHead index={hero.tag} label={hero.label} meta={hero.meta} />
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
              <InstagramGrid posts={c.images["brands.instagram"]} />
            </FadeUp>
          </section>
        </>
      );
    },
  },

  "t.approach": {
    shows: ({ c }) => !c.copy["brands.approach"].hidden && Boolean(c.copy["site.quote"].quote.trim()),
    render: ({ c }) => (
      <section className="wrap py-20 md:py-28">
        <SectionHead index={c.copy["brands.approach"].tag} label={c.copy["brands.approach"].label} className="mb-10" />
        <FadeUp>
          <Quote text={c.copy["site.quote"].quote} className="max-w-5xl" />
        </FadeUp>
      </section>
    ),
  },

  "t.brandsFaq": { shows: ({ c }) => !c.copy["brands.faq"].hidden, render: ({ c }) => <Faq copy={c.copy["brands.faq"]} /> },

  "t.brandsForm": {
    render: ({ c }) => {
      const form = c.copy["brands.form"];
      return (
        <section id="book" className="wrap scroll-mt-24 py-20 md:py-28">
          <SectionHead index={form.tag} label={form.label} meta={form.meta} className="mb-10" />
          <div className="grid gap-10 md:grid-cols-12">
            <div className="md:col-span-4">
              <h2 className="font-display text-[clamp(52px,6vw,96px)] text-ink">
                <Accent text={form.heading} />
              </h2>
            </div>
            <div className="md:col-span-7 md:col-start-6">
              <BrandForm intro={c.copy["site.forms"].brands} />
            </div>
          </div>
        </section>
      );
    },
  },

  // ---------------------------------------------------------------- for talent
  "t.talentHero": {
    render: ({ c }) => {
      const hero = c.copy["talent.hero"];
      return (
        <section className="wrap pb-16 pt-28 md:pb-24 md:pt-36">
          <SectionHead index={hero.tag} label={hero.label} meta={hero.meta} />
          <RiseLines as="h1" immediate delay={0.15} className="font-display mt-6 text-[clamp(62px,14vw,240px)] leading-[0.84] text-ink" lines={headingLines(hero.heading)} />
          <FadeUp delay={0.35} className="mt-8 grid gap-8 md:grid-cols-12">
            <p className="text-[clamp(17px,1.4vw,20px)] leading-relaxed text-ink-2 md:col-span-7">{hero.body}</p>
            {hero.button && (
              <div className="md:col-span-4 md:col-start-9 md:self-end md:justify-self-end">
                <Link href="#apply" className="btn">
                  {hero.button} <span className="arrow">→</span>
                </Link>
              </div>
            )}
          </FadeUp>
        </section>
      );
    },
  },

  "t.why": {
    shows: ({ c }) => !c.copy["talent.why"].hidden,
    render: ({ c }) => {
      const why = c.copy["talent.why"];
      return (
        <section className="wrap py-20 md:py-28">
          <SectionHead label={why.label} meta={why.meta} className="mb-10" />
          <div className="mb-12 grid gap-6 md:grid-cols-12">
            <h2 className="font-display text-[clamp(52px,6.4vw,104px)] text-ink md:col-span-7">
              <Accent text={why.heading} />
            </h2>
            {why.body && <p className="max-w-xl text-lg text-ink-2 md:col-span-4 md:col-start-9 md:self-end">{why.body}</p>}
          </div>
          <StrikeList items={why.list} />
        </section>
      );
    },
  },

  "t.talentExpect": {
    shows: ({ c }) => !c.copy["talent.expect"].hidden,
    render: ({ c }) => {
      const expect = c.copy["talent.expect"];
      return (
        <section className="wrap py-20 md:py-28">
          <SectionHead label={expect.label} className="mb-10" />
          <h2 className="font-display text-[clamp(52px,6.4vw,104px)] text-ink">
            <Accent text={expect.heading} />
          </h2>
          {expect.body && <ScrubText className="font-serif mt-10 max-w-5xl text-[clamp(24px,3vw,44px)] leading-[1.15]" text={expect.body} />}
          {expect.steps.length > 0 && (
            <>
              <SectionHead label={expect.stepsLabel} meta={countText(expect.stepsMeta, expect.steps.length)} className="mb-5 mt-16" />
              <Steps steps={expect.steps} word={expect.stepWord} />
            </>
          )}
        </section>
      );
    },
  },

  "t.forYou": {
    shows: ({ c }) => !c.copy["talent.forYou"].hidden,
    render: ({ c }) => {
      const forYou = c.copy["talent.forYou"];
      return (
        <section className="wrap py-20 md:py-28">
          <SectionHead label={forYou.label} meta={countText(forYou.meta, forYou.list.length)} className="mb-10" />
          <div className="grid gap-10 md:grid-cols-12">
            <h2 className="font-display text-[clamp(52px,6vw,96px)] text-ink md:col-span-5">
              <Accent text={forYou.heading} />
            </h2>
            <ul className="grid gap-x-8 sm:grid-cols-2 md:col-span-7 md:col-start-6">
              {forYou.list.map((t, i) => (
                <li key={`${t}-${i}`} className="flex items-center gap-4 border-b border-espresso/15 py-4 text-[17px]">
                  <span className="grid h-6 w-6 shrink-0 place-items-center bg-ink text-[12px] text-white">✓</span>
                  {t}
                </li>
              ))}
            </ul>
          </div>
        </section>
      );
    },
  },

  "t.flexible": {
    shows: ({ c }) => !c.copy["talent.flexible"].hidden,
    render: ({ c }) => {
      const flexible = c.copy["talent.flexible"];
      return (
        <section className="wrap py-20 md:py-28">
          <SectionHead label={flexible.label} className="mb-10" />
          <h2 className="font-display text-[clamp(52px,6.4vw,104px)] text-ink">
            <Accent text={flexible.heading} />
          </h2>
          <div className="mt-10 grid gap-4 md:grid-cols-3">
            {flexible.cards.map((card, i) => (
              <FadeUp key={`${card.title}-${i}`} className="border border-espresso/15 bg-white p-7">
                <h3 className="font-display text-[clamp(32px,3vw,44px)] text-ink">{card.title}</h3>
                <p className="mt-3 text-[16px] leading-relaxed text-ink-2">{card.body}</p>
              </FadeUp>
            ))}
          </div>
        </section>
      );
    },
  },

  "t.talentFaq": { shows: ({ c }) => !c.copy["talent.faq"].hidden, render: ({ c }) => <Faq copy={c.copy["talent.faq"]} /> },

  "t.talentForm": {
    render: ({ c }) => {
      const form = c.copy["talent.form"];
      return (
        <section id="apply" className="wrap scroll-mt-24 py-20 md:py-28">
          <SectionHead index={form.tag} label={form.label} className="mb-10" />
          <div className="grid gap-10 md:grid-cols-12">
            <div className="md:col-span-4">
              <h2 className="font-display text-[clamp(52px,6vw,96px)] text-ink">
                <Accent text={form.heading} />
              </h2>
            </div>
            <div className="md:col-span-7 md:col-start-6">
              <TalentForm intro={c.copy["site.forms"].talent} />
            </div>
          </div>
        </section>
      );
    },
  },

  // ---------------------------------------------------------------- services
  "t.servicesHero": {
    render: ({ c }) => {
      const hero = c.copy["services.hero"];
      const [first = "", ...rest] = hero.heading.split("\n").map((l) => l.trim()).filter(Boolean);
      return (
        <section className="wrap pb-12 pt-28 md:pb-16 md:pt-36">
          <SectionHead index={hero.tag} label={hero.label} meta={hero.meta} />
          <RiseLines
            as="h1"
            immediate
            delay={0.15}
            className="font-display mt-6 text-[clamp(62px,13vw,220px)] leading-[0.84] text-ink"
            lines={[
              <span key="first">{accent(first)}</span>,
              // the second line is set smaller, in the italic serif
              ...rest.map((l, i) => (
                <span key={i} className="font-serif block text-[0.62em] italic leading-[1.02]">
                  {l.replace(/\*/g, "")}
                </span>
              )),
            ]}
          />
        </section>
      );
    },
  },

  "t.servicesShowcase": {
    shows: ({ c }) => c.copy["services.list"].items.some((s) => s.title.trim()),
    render: ({ c }) => {
      const services: ServiceDetail[] = c.copy["services.list"].items
        .filter((s) => s.title.trim())
        .map((s, i) => ({
          id: slugify(s.title) || `service-${i + 1}`,
          title: s.title,
          steps: s.steps.filter((st) => st.name.trim()).map((st) => ({ name: st.name, text: st.text, icon: st.icon as StepIcon })),
          cta: { label: s.ctaLabel, href: s.ctaUrl || "/get-in-touch?form=brands" },
          ...(s.moreLabel && s.moreUrl ? { more: { label: s.moreLabel, href: s.moreUrl, external: /^https?:/.test(s.moreUrl) } } : {}),
        }));
      return <ServicesShowcase services={services} media={c.images["services.orbit"]} eyebrow={c.copy["services.list"].eyebrow} />;
    },
  },

  // ---------------------------------------------------------------- our work
  "t.workHero": {
    render: ({ c }) => {
      const hero = c.copy["work.hero"];
      // the last few words of the intro get the red marker underline
      const words = hero.body.trim().split(" ");
      const tail = words.length > 4 ? words.splice(-3).join(" ") : "";
      return (
        <section className="wrap pb-12 pt-28 md:pb-16 md:pt-36">
          <SectionHead index={hero.tag} label={hero.label} meta={hero.meta} />
          <div className="mt-6 flex flex-wrap items-end gap-x-5">
            <RiseLines as="h1" immediate delay={0.1} className="font-display text-[clamp(96px,17vw,290px)] leading-[0.82] text-ink" lines={[hero.heading]} />
            {hero.accent && (
              <FadeUp delay={0.4}>
                <span className="font-serif block pb-[0.18em] text-[clamp(56px,9vw,160px)] italic leading-none text-red">{hero.accent}</span>
              </FadeUp>
            )}
          </div>
          <FadeUp delay={0.5} className="mt-8 grid gap-6 md:grid-cols-12">
            <p className="text-[clamp(17px,1.4vw,20px)] leading-relaxed text-ink-2 md:col-span-6">
              {words.join(" ")}
              {tail && (
                <>
                  {" "}
                  <Mark kind="underline" delay={0.8}>
                    {tail}
                  </Mark>
                </>
              )}
            </p>
            <p className="font-mono text-[11px] font-medium uppercase leading-[1.9] tracking-[0.04em] text-muted md:col-span-4 md:col-start-9 md:text-right">
              {hero.side.map((l, i) => (
                <span key={i} className="block">
                  {l}
                </span>
              ))}
            </p>
          </FadeUp>
        </section>
      );
    },
  },

  "t.workGallery": {
    render: ({ c }) => {
      const gallery = c.copy["work.gallery"];
      const work = c.images["work.gallery"] ?? [];
      const clientsLabel = SLOTS.find((s) => s.id === "home.clients")?.label;
      const brands = Array.from(new Set((c.images["home.clients"] ?? []).map((l) => l.alt.trim()).filter((a) => a && a !== clientsLabel)));
      return (
        <section className="wrap grid gap-12 pb-24 md:grid-cols-12 md:gap-8 md:pb-32">
          {/* brand index, like the contents page of a lookbook */}
          <aside className="order-2 md:sticky md:top-28 md:order-none md:col-span-3 md:self-start">
            <SectionHead label={`${gallery.brandsLabel} (${brands.length})`} />
            <ul className="mt-2">
              {brands.map((b, i) => (
                <li key={b} className="flex items-baseline justify-between gap-3 border-b border-espresso/15 py-2">
                  <span className={`font-serif text-[clamp(22px,1.9vw,28px)] leading-tight text-ink ${i % 2 ? "italic" : ""}`}>{b}</span>
                  <sup className="font-mono text-[10px] text-muted">{String(i + 1).padStart(2, "0")}</sup>
                </li>
              ))}
            </ul>
            {gallery.button && (
              <Link href="/get-in-touch?form=brands" className="btn mt-8">
                {gallery.button} <span className="arrow">↗</span>
              </Link>
            )}
          </aside>

          <div className="md:col-span-9">
            <div className="flex items-end justify-between gap-6">
              <h2 className="font-display text-[clamp(48px,6vw,96px)] text-ink">{gallery.heading}</h2>
              <span className="pb-2 font-mono text-[11px] font-medium uppercase tracking-[0.04em] text-muted">{countText(gallery.countLabel, work.length)}</span>
            </div>
            <div className="mt-6 columns-2 gap-2 md:columns-3 md:gap-3">
              {work.map((m, i) => {
                const piece = (
                  <>
                    <WorkMedia item={m} eager={i < 3} className={m.type === "video" ? "aspect-[9/16]" : SHAPES[i % SHAPES.length]} />
                    <p className="mt-2 font-mono text-[12px] font-medium uppercase tracking-[0.04em] text-muted">
                      <span className="text-ink">{workNo(i)}</span> — {m.alt}
                    </p>
                  </>
                );
                // the first row is on screen straight away, so it shows without the fade-in
                return i < 3 ? (
                  <div key={`${m.src}-${i}`} className="group mb-2 break-inside-avoid md:mb-3">
                    {piece}
                  </div>
                ) : (
                  <FadeUp key={`${m.src}-${i}`} className="group mb-2 break-inside-avoid md:mb-3">
                    {piece}
                  </FadeUp>
                );
              })}
            </div>
          </div>
        </section>
      );
    },
  },

  "t.workNext": {
    shows: ({ c }) => !c.copy["work.next"].hidden,
    render: ({ c }) => {
      const next = c.copy["work.next"];
      return (
        <section className="bg-ink py-20 text-white md:py-28">
          <div className="wrap">
            <SectionHead tone="dark" index={next.tag} label={next.label} meta={next.meta} />
            <div className="mt-8 flex flex-col justify-between gap-10 md:flex-row md:items-end">
              <h2 className="font-display text-[clamp(64px,10vw,170px)]">
                <Accent text={next.heading} />
              </h2>
              <div className="flex flex-wrap gap-3 md:pb-4">
                {next.brandsButton && (
                  <Link href="/work-with-us" className="btn light">
                    {next.brandsButton} <span className="arrow">→</span>
                  </Link>
                )}
                {next.talentButton && (
                  <Link href="/apply-to-be-a-creator" className="btn ghost !border-white/60 !text-white hover:!text-ink [&::before]:!bg-white">
                    {next.talentButton} <span className="arrow">→</span>
                  </Link>
                )}
              </div>
            </div>
          </div>
        </section>
      );
    },
  },

  // ---------------------------------------------------------------- featured in
  "t.pressHero": {
    render: ({ c }) => {
      const hero = c.copy["press.hero"];
      return (
        <section className="wrap overflow-hidden pb-12 pt-28 md:pb-16 md:pt-36">
          <SectionHead index={hero.tag} label={hero.label} meta={hero.meta} />
          <div className="relative mt-4">
            {/* the out-of-focus word behind the headline */}
            <p
              aria-hidden
              className="blur-type font-display pointer-events-none absolute -top-[0.04em] left-[-0.03em] select-none text-[clamp(150px,30vw,520px)] leading-[0.8] text-red/70"
            >
              {hero.ghost}
            </p>
            <RiseLines as="h1" immediate delay={0.1} className="font-display relative text-[clamp(62px,15vw,260px)] leading-[0.84] text-ink" lines={headingLines(hero.heading)} />
          </div>
        </section>
      );
    },
  },

  "t.pressList": {
    render: ({ c }) => {
      const hero = c.copy["press.hero"];
      const logos = c.images["press.logos"] ?? [];
      const press = c.press;
      const empty = !logos.length && !press.length;
      return (
        <>
          {logos.length > 0 && (
            <section className="wrap pb-16 md:pb-24">
              <FadeUp>
                <PressLogos logos={logos} />
              </FadeUp>
            </section>
          )}

          {press.length > 0 && (
            <section className="wrap pb-20 md:pb-28">
              <SectionHead label={hero.featuresLabel} meta={countText(hero.featuresMeta, press.length)} className="mb-10" />
              <PressGrid items={press} readMore={c.copy["home.press"].readMore} />
            </section>
          )}

          {empty && (
            <section className="wrap pb-8">
              <FadeUp className="grid gap-8 border-t border-espresso/15 pt-8 md:grid-cols-12">
                <p className="font-serif text-[clamp(26px,3vw,44px)] leading-[1.15] text-ink md:col-span-8">{hero.empty}</p>
                {hero.emptyButton && (
                  <div className="md:col-span-3 md:col-start-10 md:self-end md:justify-self-end">
                    <Link href="/get-in-touch" className="btn">
                      {hero.emptyButton} <span className="arrow">↗</span>
                    </Link>
                  </div>
                )}
              </FadeUp>
            </section>
          )}
        </>
      );
    },
  },

  // ---------------------------------------------------------------- partner with us
  "t.partner": {
    render: ({ c, q }) => {
      const hero = c.copy["partner.hero"];
      return (
        <section className="wrap pb-24 pt-28 md:pb-32 md:pt-36">
          <SectionHead index={hero.tag} label={hero.label} meta={hero.meta} />
          <RiseLines as="h1" immediate delay={0.15} className="font-display mt-6 text-[clamp(62px,14vw,240px)] leading-[0.84] text-ink" lines={headingLines(hero.heading)} />
          <div className="mt-12 max-w-4xl md:mt-16">
            <PartnerForm intro={c.copy["site.forms"].partner} typeHint={q.for === "tech" ? "Tech company" : ""} />
          </div>
        </section>
      );
    },
  },

  // ---------------------------------------------------------------- contact
  "t.contactHero": {
    render: ({ c }) => {
      const hero = c.copy["contact.hero"];
      return (
        <section className="wrap pb-10 pt-28 md:pt-36">
          <SectionHead index={hero.tag} label={hero.label} meta={hero.meta} />
          <RiseLines as="h1" immediate delay={0.15} className="font-display mt-6 text-[clamp(62px,15vw,250px)] leading-[0.84] text-ink" lines={headingLines(hero.heading)} />
          <FadeUp delay={0.3}>{hero.line && <p className="font-serif mt-8 max-w-3xl text-[clamp(22px,2.6vw,38px)] italic leading-snug">{hero.line}</p>}</FadeUp>
        </section>
      );
    },
  },

  "t.contactCards": {
    render: ({ c, q }) => (
      <GetInTouch
        initial={FORM_KEYS.find((k) => k === q.form) ?? null}
        partnerTypeHint={q.for === "tech" ? "Tech company" : ""}
        cards={c.copy["contact.cards"]}
        intros={c.copy["site.forms"]}
      />
    ),
  },

  "t.contactSocials": {
    render: ({ c }) => (
      <section className="wrap pb-24 pt-10 md:pb-32">
        <div className="flex flex-col items-start gap-5 border-t border-espresso/15 pt-10 md:flex-row md:items-center md:justify-between">
          <p className="font-serif text-[clamp(22px,2.4vw,34px)] italic">{c.copy["contact.hero"].socials}</p>
          <SocialLinks className="text-ink" />
        </div>
      </section>
    ),
  },
};
