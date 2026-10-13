import Link from "next/link";
import Hero from "@/components/home/Hero";
import Services from "@/components/home/Services";
import Clients from "@/components/home/Clients";
import DualCta from "@/components/home/DualCta";
import Infographic from "@/components/home/Infographic";
import VideoOrbit from "@/components/home/VideoOrbit";
import { FadeUp } from "@/components/site/Reveal";
import { AGENCY_INTRO, SERVICE_COPY } from "@/lib/content";
import { getSiteContent } from "@/lib/backend";

export default async function Home() {
  const { images, settings } = await getSiteContent();
  const wall = images["home.wall"];

  return (
    <>
      <Hero images={wall} settings={settings} />

      <section className="wrap grid items-center gap-10 py-20 md:grid-cols-12 md:py-28">
        <div className="md:col-span-5">
          <p className="eyebrow mb-2">The agency</p>
          <VideoOrbit items={images["home.videos"]} />
        </div>
        <FadeUp className="md:col-span-6 md:col-start-7">
          <p className="text-[clamp(18px,1.6vw,23px)] leading-[1.55] text-ink">{AGENCY_INTRO}</p>
          <Link href="/about" className="btn mt-10">
            Get to know us <span className="arrow">→</span>
          </Link>
        </FadeUp>
      </section>

      <Services services={SERVICE_COPY} />

      <Clients logos={images["home.clients"]} />

      <DualCta style={settings.ctaStyle} brands={images["contact.brands"]?.[0]} talent={images["contact.talent"]?.[0]} />

      <Infographic />
    </>
  );
}
