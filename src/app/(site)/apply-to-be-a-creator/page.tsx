import type { Metadata } from "next";
import JsonLd from "@/components/site/JsonLd";
import { breadcrumbJsonLd, pageMetadata } from "@/lib/seo";
import Link from "next/link";
import { StrikeList } from "@/components/about/AboutFx";
import TalentForm from "@/components/forms/TalentForm";
import Clients from "@/components/home/Clients";
import { Steps } from "@/components/sections/Blocks";
import Accent, { headingLines } from "@/components/site/Accent";
import { SectionHead } from "@/components/site/Editorial";
import { FadeUp, RiseLines, ScrubText } from "@/components/site/Reveal";
import Faq from "@/components/sections/Faq";
import { getSiteContent } from "@/lib/backend";

export const metadata: Metadata = pageMetadata("talent");

export default async function ForTalent() {
  const { images, copy } = await getSiteContent();
  const hero = copy["talent.hero"];
  const why = copy["talent.why"];
  const expect = copy["talent.expect"];
  const forYou = copy["talent.forYou"];
  const flexible = copy["talent.flexible"];
  const form = copy["talent.form"];

  // section numbers run on through whatever is showing
  let k = 0;
  const num = (on: boolean) => (on ? String(++k).padStart(2, "0") : "");
  const n = { why: num(!why.hidden), expect: num(!expect.hidden), forYou: num(!forYou.hidden), flexible: num(!flexible.hidden) };

  return (
    <>
      <JsonLd data={breadcrumbJsonLd("talent")} />
      <section className="wrap pb-16 pt-28 md:pb-24 md:pt-36">
        <SectionHead index="For talent" label={hero.label} meta={hero.meta} />
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

      {!why.hidden && (
        <section className="wrap py-20 md:py-28">
          <SectionHead index={n.why} label={why.label} meta={why.meta} className="mb-10" />
          <div className="mb-12 grid gap-6 md:grid-cols-12">
            <h2 className="font-display text-[clamp(52px,6.4vw,104px)] text-ink md:col-span-7">
              <Accent text={why.heading} />
            </h2>
            {why.body && <p className="max-w-xl text-lg text-ink-2 md:col-span-4 md:col-start-9 md:self-end">{why.body}</p>}
          </div>
          <StrikeList items={why.list} />
        </section>
      )}

      {!expect.hidden && (
        <section className="wrap py-20 md:py-28">
          <SectionHead index={n.expect} label={expect.label} className="mb-10" />
          <h2 className="font-display text-[clamp(52px,6.4vw,104px)] text-ink">
            <Accent text={expect.heading} />
          </h2>
          {expect.body && <ScrubText className="font-serif mt-10 max-w-5xl text-[clamp(24px,3vw,44px)] leading-[1.15]" text={expect.body} />}
          {expect.steps.length > 0 && (
            <>
              <SectionHead label={expect.stepsLabel} meta={`${expect.steps.length} steps`} className="mb-5 mt-16" />
              <Steps steps={expect.steps} />
            </>
          )}
        </section>
      )}

      {!forYou.hidden && (
        <section className="wrap py-20 md:py-28">
          <SectionHead index={n.forYou} label={forYou.label} meta={`${forYou.list.length} included`} className="mb-10" />
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
      )}

      {!flexible.hidden && (
        <section className="wrap py-20 md:py-28">
          <SectionHead index={n.flexible} label={flexible.label} className="mb-10" />
          <h2 className="font-display text-[clamp(52px,6.4vw,104px)] text-ink">
            <Accent text={flexible.heading} />
          </h2>
          <div className="mt-10 grid gap-4 md:grid-cols-3">
            {flexible.cards.map((c, i) => (
              <FadeUp key={`${c.title}-${i}`} className="border border-espresso/15 bg-white p-7">
                <h3 className="font-display text-[clamp(32px,3vw,44px)] text-ink">{c.title}</h3>
                <p className="mt-3 text-[16px] leading-relaxed text-ink-2">{c.body}</p>
              </FadeUp>
            ))}
          </div>
        </section>
      )}

      {!copy["site.clients"].hidden && <Clients logos={images["home.clients"]} copy={copy["site.clients"]} />}

      {!copy["talent.faq"].hidden && <Faq copy={copy["talent.faq"]} />}

      <section id="apply" className="wrap scroll-mt-24 py-20 md:py-28">
        <SectionHead index="Apply now" label={form.label} className="mb-10" />
        <div className="grid gap-10 md:grid-cols-12">
          <div className="md:col-span-4">
            <h2 className="font-display text-[clamp(52px,6vw,96px)] text-ink">
              <Accent text={form.heading} />
            </h2>
          </div>
          <div className="md:col-span-7 md:col-start-6">
            <TalentForm intro={copy["site.forms"].talent} />
          </div>
        </div>
      </section>
    </>
  );
}
