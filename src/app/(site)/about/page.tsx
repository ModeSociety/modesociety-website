import type { Metadata } from "next";
import Infographic from "@/components/home/Infographic";
import VideoOrbit from "@/components/home/VideoOrbit";
import { Accordion, ExpectCards, Quote } from "@/components/sections/Blocks";
import { SectionHead } from "@/components/site/Editorial";
import { FadeUp, RiseLines } from "@/components/site/Reveal";
import { ABOUT, AGENCY_INTRO, SERVICE_COPY } from "@/lib/content";
import { getSiteContent } from "@/lib/backend";

export const metadata: Metadata = { title: "About us" };

export default async function About() {
  const { images } = await getSiteContent();
  const team = images["about.team"]?.[0];

  return (
    <>
      <section className="wrap pt-28 md:pt-36">
        <SectionHead index="About" label="Mode Society" meta="Est. January 2022 · Melbourne" />
        <RiseLines
          as="h1"
          immediate
          delay={0.1}
          className="font-display mt-6 text-[clamp(62px,15vw,250px)] leading-[0.84] text-ink"
          lines={[<span key="l">About <span className="font-serif italic">us.</span></span>]}
        />
      </section>

      <section className="wrap grid gap-12 pb-20 pt-12 md:grid-cols-12 md:pb-28 md:pt-16">
        <div className="md:col-span-7">
          <FadeUp>
            <Quote />
          </FadeUp>
          <div className="mt-12">
            <Accordion
              defaultOpen={0}
              items={[
                {
                  title: "Our story",
                  body: (
                    <>
                      <p>{ABOUT.story}</p>
                      <p className="mt-4">{AGENCY_INTRO}</p>
                      <p className="mt-4">{ABOUT.grantHelp}</p>
                    </>
                  ),
                },
                {
                  title: "What we are",
                  body: (
                    <ul className="grid gap-3">
                      {ABOUT.whatWeAre.map((w) => (
                        <li key={w} className="flex gap-3">
                          <span className="mt-[9px] h-1.5 w-1.5 shrink-0 rounded-full bg-ink" /> {w}
                        </li>
                      ))}
                    </ul>
                  ),
                },
              ]}
            />
          </div>
        </div>
        <div className="md:col-span-4 md:col-start-9 md:pt-10">
          <FadeUp>
            {team ? (
              <div className="grain">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={team.src} alt={team.alt || "The Mode Society team"} className="w-full object-cover" />
              </div>
            ) : (
              <div className="grid aspect-[4/3] w-full place-items-center border border-dashed border-line text-center text-sm text-muted">
                Team photo: add it to the Drive folder &ldquo;About Us 1&rdquo;
              </div>
            )}
            <p className="mt-3 font-mono text-[11px] font-medium uppercase leading-relaxed tracking-[0.04em] text-muted">
              <span className="text-ink">Fig. 01</span> — {ABOUT.team.replace("Our team: ", "")}
            </p>
          </FadeUp>
        </div>
      </section>

      <section className="wrap py-20 md:py-28">
        <SectionHead index="01" label="What we do" meta="Four services" className="mb-10" />
        <div className="grid items-center gap-10 md:grid-cols-12">
        <div className="md:col-span-6">
          <h2 className="font-display text-[clamp(52px,6.6vw,108px)] text-ink">
            Creators your customers{" "}
            <span className="font-serif italic">actually trust.</span>
          </h2>
          <div className="mt-10">
            <Accordion items={SERVICE_COPY.map((s) => ({ title: s.title, body: <ServiceBody text={s.body} link={s.link} /> }))} />
          </div>
        </div>
        <div className="md:col-span-5 md:col-start-8">
          <VideoOrbit items={images["home.videos"]} />
        </div>
        </div>
      </section>

      <Infographic index="02" />

      <ExpectCards />
    </>
  );
}

function ServiceBody({ text, link }: { text: string; link?: { href: string; label: string } }) {
  return (
    <>
      <p>{text}</p>
      {link && (
        <a href={link.href} target="_blank" rel="noreferrer" className="mt-3 inline-block font-mono text-[12px] font-medium uppercase tracking-[0.04em] underline underline-offset-4">
          {link.label}
        </a>
      )}
    </>
  );
}
