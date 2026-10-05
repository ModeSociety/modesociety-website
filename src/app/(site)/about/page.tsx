import type { Metadata } from "next";
import Infographic from "@/components/home/Infographic";
import VideoOrbit from "@/components/home/VideoOrbit";
import { Accordion, ExpectCards, Quote } from "@/components/sections/Blocks";
import { FadeUp } from "@/components/site/Reveal";
import { ABOUT, AGENCY_INTRO, SERVICE_COPY } from "@/lib/content";
import { getSiteContent } from "@/lib/backend";

export const metadata: Metadata = { title: "About us" };

export default async function About() {
  const { images } = await getSiteContent();
  const team = images["about.team"]?.[0];

  return (
    <>
      <section className="wrap grid gap-12 pb-20 pt-32 md:grid-cols-12 md:pb-28 md:pt-40">
        <div className="md:col-span-7">
          <h1 className="eyebrow !text-[13px] !text-ink">About us</h1>
          <FadeUp className="mt-6">
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
              // eslint-disable-next-line @next/next/no-img-element
              <img src={team.src} alt={team.alt || "The Mode Society team"} className="w-full rounded-[4px] object-cover" />
            ) : (
              <div className="grid aspect-[4/3] w-full place-items-center rounded-[4px] border border-dashed border-line text-center text-sm text-muted">
                Team photo: add it to the Drive folder &ldquo;About Us 1&rdquo;
              </div>
            )}
            <p className="font-serif mt-4 text-lg italic">{ABOUT.team}</p>
          </FadeUp>
        </div>
      </section>

      <section className="wrap grid items-center gap-10 py-20 md:grid-cols-12 md:py-28">
        <div className="md:col-span-6">
          <h2 className="font-display text-[clamp(30px,4.4vw,64px)]">
            Creators your customers <span className="font-serif italic tracking-normal">actually trust.</span>
          </h2>
          <div className="mt-10">
            <Accordion items={SERVICE_COPY.map((s) => ({ title: s.title, body: <ServiceBody text={s.body} link={s.link} /> }))} />
          </div>
        </div>
        <div className="md:col-span-5 md:col-start-8">
          <VideoOrbit items={images["home.videos"]} />
        </div>
      </section>

      <Infographic />

      <ExpectCards />
    </>
  );
}

function ServiceBody({ text, link }: { text: string; link?: { href: string; label: string } }) {
  return (
    <>
      <p>{text}</p>
      {link && (
        <a href={link.href} target="_blank" rel="noreferrer" className="mt-3 inline-block font-semibold underline underline-offset-4">
          {link.label}
        </a>
      )}
    </>
  );
}
