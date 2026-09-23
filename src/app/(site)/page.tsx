import Link from "next/link";
import Hero from "@/components/home/Hero";
import Services from "@/components/home/Services";
import { SERVICE_COPY } from "@/lib/content";
import GameSection from "@/components/home/games/GameSection";
import Clients from "@/components/home/Clients";
import DualCta from "@/components/home/DualCta";
import Marquee from "@/components/site/Marquee";
import { RiseLines, ScrubText } from "@/components/site/Reveal";
import { getSiteContent } from "@/lib/backend";

const ROLES = ["UGC", "Influencers", "Models", "Streamers", "Content creators"];
const NICHES = ["Beauty", "Wellness", "Fashion", "Gaming", "Tech", "Lifestyle", "Fitness", "Events"];

export default async function Home() {
  const { images, settings } = await getSiteContent();
  const wall = images["home.wall"];
  const casting = images["home.casting"].length >= 2 ? images["home.casting"] : wall.slice(0, 6);
  const services = SERVICE_COPY.map((s) => ({ ...s, image: images[s.key]?.[0] }));

  return (
    <>
      <Hero images={wall} settings={settings} />

      <div className="border-y border-ink bg-ink py-5 text-paper">
        <Marquee speed={70}>
          {ROLES.map((r) => (
            <span key={r} className="flex items-center">
              <span className="font-display px-6 text-[clamp(22px,3vw,42px)] uppercase">{r}</span>
              <span className="font-serif text-[clamp(22px,3vw,42px)] italic text-pin">〰</span>
            </span>
          ))}
        </Marquee>
      </div>

      <section className="wrap grid gap-10 py-28 md:grid-cols-12 md:py-40">
        <div className="md:col-span-3">
          <p className="eyebrow">(01) The agency</p>
        </div>
        <div className="md:col-span-9">
          <ScrubText
            className="font-serif text-[clamp(30px,4.2vw,64px)] leading-[1.08] tracking-[-0.01em]"
            text="From gaming to fashion and beauty, our roster is built on quality over volume. We handle the relationship end to end, so brands get seamless execution and talent get partnerships that actually complement their niche."
          />
          <div className="mt-12 flex flex-wrap items-center gap-6">
            <Link href="/about" className="btn ghost">
              Our story <span className="arrow">→</span>
            </Link>
            <span className="text-sm text-muted">Beauty · wellness · fashion · gaming · technology</span>
          </div>
        </div>
      </section>

      <Services services={services} />

      <GameSection mode={settings.gameMode} faces={casting} pool={wall} />

      <section className="py-20 md:py-28">
        <div className="wrap mb-10">
          <RiseLines
            className="font-display text-[clamp(28px,4vw,60px)]"
            lines={["Worldwide talent,", <span key="b" className="font-serif italic tracking-normal">every niche that matters.</span>]}
          />
        </div>
        <Marquee speed={45} reverse>
          {NICHES.map((n, i) => (
            <span key={n} className="flex items-center">
              <span
                className={`px-5 text-[clamp(40px,7vw,110px)] leading-[1.2] ${i % 2 ? "font-serif italic" : "font-display uppercase"}`}
              >
                {n}
              </span>
              <span className="h-3 w-3 rounded-full bg-pin" />
            </span>
          ))}
        </Marquee>
      </section>

      <Clients logos={images["home.clients"]} />

      <DualCta style={settings.ctaStyle} brands={images["contact.brands"]?.[0]} talent={images["contact.talent"]?.[0]} />
    </>
  );
}
