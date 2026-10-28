import type { Metadata } from "next";
import JsonLd from "@/components/site/JsonLd";
import { breadcrumbJsonLd, pageMetadata } from "@/lib/seo";
import Infographic from "@/components/home/Infographic";
import VideoOrbit from "@/components/home/VideoOrbit";
import { Accordion, ExpectCards, Quote } from "@/components/sections/Blocks";
import Accent, { headingLines } from "@/components/site/Accent";
import { SectionHead } from "@/components/site/Editorial";
import { FadeUp, RiseLines } from "@/components/site/Reveal";
import { getSiteContent } from "@/lib/backend";
import { responsive } from "@/lib/img";

export const metadata: Metadata = pageMetadata("about");

export default async function About() {
  const { images, copy } = await getSiteContent();
  const team = images["about.team"]?.[0];
  const hero = copy["about.hero"];
  const story = copy["about.story"];
  const what = copy["about.services"];
  const services = copy["site.services"].items.filter((s) => s.title.trim());
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
    <>
      <JsonLd data={breadcrumbJsonLd("about")} />
      <section className="wrap pt-28 md:pt-36">
        <SectionHead index="About" label={hero.label} meta={hero.meta} />
        <RiseLines as="h1" immediate delay={0.1} className="font-display mt-6 text-[clamp(62px,15vw,250px)] leading-[0.84] text-ink" lines={headingLines(hero.heading)} />
      </section>

      <section className="wrap grid gap-12 pb-20 pt-12 md:grid-cols-12 md:pb-28 md:pt-16">
        <div className="md:col-span-7">
          <FadeUp>
            <Quote text={copy["site.quote"].quote} />
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
                <span className="text-ink">Fig. 01</span> — {story.caption}
              </p>
            )}
          </FadeUp>
        </div>
      </section>

      {!what.hidden && (
        <section className="wrap py-20 md:py-28">
          <SectionHead index="01" label={what.label} meta={what.meta} className="mb-10" />
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
              <VideoOrbit items={images["home.videos"]} />
            </div>
          </div>
        </section>
      )}

      {!copy["site.numbers"].hidden && <Infographic index={what.hidden ? "01" : "02"} copy={copy["site.numbers"]} />}

      {!copy["site.expect"].hidden && <ExpectCards copy={copy["site.expect"]} />}
    </>
  );
}

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
