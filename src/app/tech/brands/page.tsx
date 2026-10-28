import type { Metadata } from "next";
import { redirect } from "next/navigation";
import Link from "next/link";
import JsonLd from "@/components/site/JsonLd";
import { FadeUp } from "@/components/site/Reveal";
import IntroVideo from "@/components/site/IntroVideo";
import { embedFor } from "@/lib/video";
import CountUp from "@/components/tech/CountUp";
import PageHead from "@/components/tech/PageHead";
import Process from "@/components/tech/Process";
import { Categories, Formats, TechFaq } from "@/components/tech/Sections";
import { SectionTitle } from "@/components/tech/ui";
import { getSiteContent } from "@/lib/backend";
import { techMode } from "@/lib/techMode";
import { breadcrumbJsonLd, pageMetadata } from "@/lib/seo";
import { totalFollowers } from "@/lib/tech";

export const metadata: Metadata = pageMetadata("techBrands");

export default async function TechBrands() {
  // not public until ModeSociety Tech is launched (admins can preview it)
  if ((await techMode()).landing) redirect("/tech");
  const { images, roster, techStats, copy } = await getSiteContent();
  const followers = roster.reduce((s, m) => s + totalFollowers(m), 0);
  // only real numbers: roster followers, and what the team enters in the admin panel
  const stats = [
    followers ? { value: followers as number | string, label: "Combined followers" } : null,
    techStats.views ? { value: techStats.views, label: "Combined total views" } : null,
    techStats.campaigns ? { value: techStats.campaigns, label: "Campaigns delivered" } : null,
  ].filter(Boolean) as { value: number | string; label: string }[];
  const hero = copy["techBrands.hero"];
  const process = copy["techBrands.process"];
  const run = copy["techBrands.run"];
  const intro = copy["techHome.intro"];
  const film = images["tech.intro"]?.[0];
  const faq = copy["tech.faq"];

  return (
    <>
      <JsonLd data={breadcrumbJsonLd("techBrands")} />
      <PageHead eyebrow={hero.eyebrow} title={hero.heading} ghost={hero.ghost} lead={hero.lead}>
        {hero.button && (
          <Link href="/tech/contact?as=brand" className="btn">
            {hero.button} <span className="arrow">→</span>
          </Link>
        )}
      </PageHead>

      {/* key numbers */}
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
          <p className="t-panel p-8 text-[15px] text-t2">Our key numbers (combined followers, views and campaigns delivered) appear here as the roster and first campaigns go live.</p>
        )}
      </section>

      {!intro.hidden && (embedFor(intro.videoUrl) || film) && (
        <section className="wrap pb-20 md:pb-28">
          <FadeUp className="t-panel overflow-hidden p-2">
            <IntroVideo media={film} url={intro.videoUrl} label="An introduction to ModeSociety Tech" className="rounded-[18px]" buttonClassName="bg-white text-[#0b1438]" />
          </FadeUp>
        </section>
      )}

      {!process.hidden && (
        <section className="wrap py-20 md:py-28">
          <SectionTitle eyebrow={process.eyebrow} title={process.heading} className="mb-14" />
          <Process steps={process.steps.filter((s) => s.title.trim())} />
        </section>
      )}

      {!run.hidden && (
        <section className="wrap py-20 md:py-28">
          <SectionTitle title={run.heading} lead={run.lead} className="mb-10" />
          <Formats items={copy["tech.formats"].items} />
          <div className="mt-16">
            {run.categoriesTitle && <SectionTitle title={run.categoriesTitle} className="mb-8" />}
            <Categories items={copy["tech.categories"].items} />
          </div>
        </section>
      )}

      {!faq.hidden && <TechFaq heading={faq.heading} lead={faq.lead} groups={[{ label: "For brands", items: faq.brands }]} />}
    </>
  );
}
