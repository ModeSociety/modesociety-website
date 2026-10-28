import type { Metadata } from "next";
import Link from "next/link";
import Hero from "@/components/home/Hero";
import Services from "@/components/home/Services";
import Clients from "@/components/home/Clients";
import DualCta from "@/components/home/DualCta";
import Infographic from "@/components/home/Infographic";
import VideoOrbit from "@/components/home/VideoOrbit";
import { FeaturedStrip } from "@/components/press/Press";
import WorkTeaser from "@/components/work/WorkTeaser";
import Accent from "@/components/site/Accent";
import IntroVideo from "@/components/site/IntroVideo";
import { SectionHead } from "@/components/site/Editorial";
import { FadeUp } from "@/components/site/Reveal";
import { getSiteContent } from "@/lib/backend";
import { embedFor } from "@/lib/video";
import { pageMetadata } from "@/lib/seo";

export async function generateMetadata(): Promise<Metadata> {
  const base = pageMetadata("home");
  const { images } = await getSiteContent();
  const share = images["meta.share"]?.[0];
  if (!share) return base;
  const img = { url: share.src, alt: share.alt || "Mode Society" };
  return { ...base, openGraph: { ...base.openGraph, images: [img] }, twitter: { ...base.twitter, images: [img.url] } };
}

export default async function Home() {
  const { images, settings, press, copy } = await getSiteContent();
  const wall = images["home.wall"];
  const logos = images["press.logos"] ?? [];
  const agency = copy["home.agency"];
  const intro = copy["home.intro"];
  const film = images["home.intro"]?.[0];

  // section numbers run on through whatever is showing
  const shown = {
    intro: !intro.hidden && Boolean(embedFor(intro.videoUrl) || film),
    agency: !agency.hidden,
    services: true,
    work: !copy["home.work"].hidden && (images["work.gallery"]?.length ?? 0) > 0,
    clients: !copy["site.clients"].hidden && (images["home.clients"]?.length ?? 0) > 0,
    press: !copy["home.press"].hidden && (logos.length > 0 || press.length > 0),
    cta: !copy["site.cta"].hidden,
    numbers: !copy["site.numbers"].hidden,
  };
  let k = 0;
  const n = Object.fromEntries(Object.entries(shown).map(([key, on]) => [key, on ? String(++k).padStart(2, "0") : ""])) as Record<keyof typeof shown, string>;

  return (
    <>
      <Hero images={wall} settings={settings} text={copy["home.hero"]} />

      {shown.intro && (
        <section className="wrap pt-20 md:pt-28" aria-label="Intro film">
          <SectionHead index={n.intro} label={intro.label} meta={intro.meta} />
          <div className="mt-8 flex flex-col justify-between gap-6 md:flex-row md:items-end">
            <h2 className="font-display text-[clamp(52px,7.6vw,124px)] text-ink">
              <Accent text={intro.heading} />
            </h2>
            {intro.body && <p className="max-w-sm text-[16px] leading-relaxed text-ink-2 md:pb-3">{intro.body}</p>}
          </div>
          <FadeUp className="mt-10">
            <IntroVideo media={film} url={intro.videoUrl} label="An introduction to Mode Society" className="grain" buttonClassName="bg-paper text-ink !rounded-none font-mono !text-[11px] md:!text-[12px] uppercase tracking-[0.06em]" />
          </FadeUp>
        </section>
      )}

      {shown.agency && (
        <section className="wrap py-20 md:py-28">
          <SectionHead index={n.agency} label={agency.label} meta={agency.meta} />
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
              <VideoOrbit items={images["home.videos"]} />
            </div>
          </div>
        </section>
      )}

      <Services copy={copy["site.services"]} quote={copy["site.quote"].quote} index={n.services} />

      {shown.work && <WorkTeaser items={images["work.gallery"] ?? []} index={n.work} copy={copy["home.work"]} />}

      {shown.clients && <Clients logos={images["home.clients"]} index={n.clients} copy={copy["site.clients"]} />}

      {shown.press && <FeaturedStrip logos={logos} items={press} index={n.press} copy={copy["home.press"]} />}

      {shown.cta && (
        <DualCta style={settings.ctaStyle} brands={images["contact.brands"]?.[0]} talent={images["contact.talent"]?.[0]} index={n.cta} copy={copy["site.cta"]} />
      )}

      {shown.numbers && <Infographic index={n.numbers} copy={copy["site.numbers"]} />}
    </>
  );
}
