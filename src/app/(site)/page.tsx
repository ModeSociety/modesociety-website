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
import { SectionHead } from "@/components/site/Editorial";
import { FadeUp } from "@/components/site/Reveal";
import { AGENCY_INTRO, AGENCY_LEAD, SERVICE_COPY } from "@/lib/content";
import { getSiteContent } from "@/lib/backend";
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
  const { images, settings, press } = await getSiteContent();
  const wall = images["home.wall"];
  const logos = images["press.logos"] ?? [];
  const hasPress = logos.length > 0 || press.length > 0;
  // section numbers run on, skipping "Featured in" until there's press to show
  const n = (k: number) => String(k + (hasPress && k >= 5 ? 1 : 0)).padStart(2, "0");

  return (
    <>
      <Hero images={wall} settings={settings} />

      <section className="wrap py-20 md:py-28">
        <SectionHead index={n(1)} label="The agency" meta="Boutique · female-led · Melbourne" />
        <div className="mt-10 grid items-center gap-10 md:grid-cols-12">
          <FadeUp className="md:col-span-7">
            <h2 className="font-display text-[clamp(52px,7.6vw,124px)] text-ink">
              Think of us as your{" "}
              <span className="font-serif italic">external</span>{" "}
              PR team.
            </h2>
            <p className="mt-8 max-w-xl text-[clamp(17px,1.4vw,20px)] leading-[1.6] text-ink-2">
              {AGENCY_INTRO.replace(AGENCY_LEAD, "").trim()}
            </p>
            <Link href="/about" className="btn mt-9">
              Get to know us <span className="arrow">→</span>
            </Link>
          </FadeUp>
          <div className="md:col-span-5">
            <VideoOrbit items={images["home.videos"]} />
          </div>
        </div>
      </section>

      <Services services={SERVICE_COPY} />

      <WorkTeaser items={images["work.gallery"] ?? []} index={n(3)} />

      <Clients logos={images["home.clients"]} index={n(4)} />

      <FeaturedStrip logos={logos} items={press} index="05" />

      <DualCta style={settings.ctaStyle} brands={images["contact.brands"]?.[0]} talent={images["contact.talent"]?.[0]} index={n(5)} />

      <Infographic index={n(6)} />
    </>
  );
}
