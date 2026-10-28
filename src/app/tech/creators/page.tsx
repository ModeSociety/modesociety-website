import type { Metadata } from "next";
import Link from "next/link";
import JsonLd from "@/components/site/JsonLd";
import { FadeUp } from "@/components/site/Reveal";
import PageHead from "@/components/tech/PageHead";
import RosterCard from "@/components/tech/RosterCard";
import { Policy, TechFaq } from "@/components/tech/Sections";
import { Beams, SampleTag, SectionTitle } from "@/components/tech/ui";
import { getSiteContent } from "@/lib/backend";
import { breadcrumbJsonLd, pageMetadata } from "@/lib/seo";
import { rosterFor, TECH_FAQ_CREATORS, TECH_FOR_CREATORS } from "@/lib/tech";

export const metadata: Metadata = pageMetadata("techCreators");

export default async function TechCreators() {
  const { roster } = await getSiteContent();
  const { members, sample } = rosterFor(roster);
  const quotes = roster.filter((m) => m.quote);
  const examples = (members.filter((m) => m.featured).length ? members.filter((m) => m.featured) : members).slice(0, 4);

  return (
    <>
      <JsonLd data={breadcrumbJsonLd("techCreators")} />
      <PageHead eyebrow="For creators" title="Get signed." ghost="Join." lead="Management for streamers, content creators and esports athletes. Adults only, by application.">
        <Link href="/tech/contact?as=creator" className="btn">
          Apply to sign <span className="arrow">→</span>
        </Link>
      </PageHead>

      <section className="wrap pb-20 md:pb-28">
        <SectionTitle title="What we do for you." className="mb-10" />
        <div className="grid gap-3 md:grid-cols-2">
          {TECH_FOR_CREATORS.map((c, i) => (
            <FadeUp key={c.title} delay={(i % 2) * 0.06} className="t-panel t-foil flex min-h-[220px] flex-col justify-between p-8">
              <span className="tech-mono text-[11px] text-taccent">0{i + 1}</span>
              <div>
                <h3 className="tech-display text-[clamp(32px,3vw,46px)] text-t">{c.title}</h3>
                <p className="mt-3 max-w-lg text-[15.5px] leading-relaxed text-t2">{c.body}</p>
              </div>
            </FadeUp>
          ))}
        </div>
      </section>

      {/* creator examples / testimonials */}
      <section className="wrap py-20 md:py-28">
        <div className="mb-10 flex flex-wrap items-end justify-between gap-6">
          <SectionTitle eyebrow="Creator examples" title="Who we look after." />
          {sample && (
            <span className="flex items-center gap-2 text-[13px] text-t3">
              <SampleTag /> Sample cards for layout, not real creators.
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

      <Policy />

      <section className="wrap py-20 md:py-28">
        <div className="t-panel relative overflow-hidden p-8 md:p-14">
          <Beams />
          <div className="relative grid gap-10 md:grid-cols-2 md:items-end">
            <div>
              <h2 className="tech-wide text-[clamp(40px,5.6vw,84px)] text-t">Get on the roster.</h2>
              <p className="mt-5 max-w-md text-[16px] text-t2">
                Streamers, creators, esports athletes and teams across gaming and tech can apply. Our team reviews every application.
              </p>
            </div>
            <div className="flex flex-wrap gap-3 md:justify-end">
              <Link href="/tech/contact?as=creator" className="btn">
                Apply to sign <span className="arrow">→</span>
              </Link>
              <Link href="/tech/talent" className="btn ghost">
                See the roster
              </Link>
            </div>
          </div>
        </div>
      </section>

      <TechFaq groups={[{ label: "For creators", items: TECH_FAQ_CREATORS }]} />
    </>
  );
}
