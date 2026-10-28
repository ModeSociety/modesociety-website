import type { Metadata } from "next";
import Link from "next/link";
import JsonLd from "@/components/site/JsonLd";
import { FadeUp } from "@/components/site/Reveal";
import CountUp from "@/components/tech/CountUp";
import PageHead from "@/components/tech/PageHead";
import Process from "@/components/tech/Process";
import { Categories, Formats, TechFaq } from "@/components/tech/Sections";
import { SectionTitle } from "@/components/tech/ui";
import { getSiteContent } from "@/lib/backend";
import { breadcrumbJsonLd, pageMetadata } from "@/lib/seo";
import { TECH_FAQ_BRANDS, totalFollowers } from "@/lib/tech";

export const metadata: Metadata = pageMetadata("techBrands");

export default async function TechBrands() {
  const { images, roster, techStats } = await getSiteContent();
  const followers = roster.reduce((s, m) => s + totalFollowers(m), 0);
  // only real numbers: roster followers, and what the team enters in the admin panel
  const stats = [
    followers ? { value: followers as number | string, label: "Combined followers" } : null,
    techStats.views ? { value: techStats.views, label: "Combined total views" } : null,
    techStats.campaigns ? { value: techStats.campaigns, label: "Campaigns delivered" } : null,
  ].filter(Boolean) as { value: number | string; label: string }[];
  const intro = images["tech.intro"]?.[0];

  return (
    <>
      <JsonLd data={breadcrumbJsonLd("techBrands")} />
      <PageHead
        eyebrow="For brands"
        title="Why brands call us."
        ghost="Brief."
        lead="Creator campaigns, UGC, streams and event guest lists, built around your brand."
      >
        <Link href="/tech/contact?as=brand" className="btn">
          Brand enquiry <span className="arrow">→</span>
        </Link>
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

      {intro && (
        <section className="wrap pb-20 md:pb-28">
          <FadeUp className="t-panel overflow-hidden p-2">
            {intro.type === "video" ? (
              <video src={intro.src} controls playsInline preload="metadata" className="aspect-video w-full rounded-[18px] bg-black object-cover" aria-label="An introduction to ModeSociety Tech" />
            ) : (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={intro.src} alt={intro.alt} className="aspect-video w-full rounded-[18px] object-cover" />
            )}
          </FadeUp>
        </section>
      )}

      <section className="wrap py-20 md:py-28">
        <SectionTitle eyebrow="How a campaign runs" title="Our process." className="mb-14" />
        <Process />
      </section>

      <section className="wrap py-20 md:py-28">
        <SectionTitle title="What we run." lead="Formats we build campaigns from, mixed to suit your goal." className="mb-10" />
        <Formats />
        <div className="mt-16">
          <SectionTitle title="Who we work with." className="mb-8" />
          <Categories />
        </div>
      </section>

      <TechFaq groups={[{ label: "For brands", items: TECH_FAQ_BRANDS }]} />
    </>
  );
}
