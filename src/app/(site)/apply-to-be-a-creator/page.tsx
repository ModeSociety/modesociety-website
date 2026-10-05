import type { Metadata } from "next";
import Link from "next/link";
import { StrikeList } from "@/components/about/AboutFx";
import TalentForm from "@/components/forms/TalentForm";
import Clients from "@/components/home/Clients";
import { Steps } from "@/components/sections/Blocks";
import { FadeUp, RiseLines, ScrubText } from "@/components/site/Reveal";
import { TALENT } from "@/lib/content";
import { getSiteContent } from "@/lib/backend";

export const metadata: Metadata = { title: "For talent" };

export default async function ForTalent() {
  const { images } = await getSiteContent();
  return (
    <>
      <section className="wrap pb-16 pt-32 md:pb-24 md:pt-44">
        <p className="eyebrow">For talent</p>
        <RiseLines
          as="h1"
          immediate
          delay={0.15}
          className="font-display mt-5 text-[clamp(40px,7vw,110px)]"
          lines={["Thinking of", <span key="t" className="font-serif italic tracking-normal">signing?</span>]}
        />
        <FadeUp delay={0.35} className="mt-8 grid gap-8 md:grid-cols-12">
          <p className="text-[clamp(17px,1.4vw,20px)] leading-relaxed text-ink-2 md:col-span-7">{TALENT.intro}</p>
          <div className="md:col-span-4 md:col-start-9 md:self-end md:justify-self-end">
            <Link href="#apply" className="btn">
              Apply now <span className="arrow">→</span>
            </Link>
          </div>
        </FadeUp>
      </section>

      <section className="wrap py-20 md:py-28">
        <div className="mb-12 grid gap-6 md:grid-cols-12">
          <h2 className="font-display text-[clamp(28px,3.6vw,52px)] md:col-span-6">
            Why we started <span className="font-serif italic tracking-normal">Mode Society.</span>
          </h2>
          <p className="max-w-xl text-lg text-ink-2 md:col-span-5 md:col-start-8">
            Traditional representation left too many creators frustrated. So we built the agency we wished we&apos;d had.
          </p>
        </div>
        <StrikeList items={TALENT.frustrations} />
      </section>

      <section className="wrap py-20 md:py-28">
        <h2 className="font-display text-[clamp(28px,3.6vw,52px)]">
          What you can expect <span className="font-serif italic tracking-normal">from us.</span>
        </h2>
        <ScrubText className="font-serif mt-10 max-w-5xl text-[clamp(24px,3vw,44px)] leading-[1.15]" text={TALENT.created} />
        <p className="eyebrow mb-5 mt-16">From signing to getting paid</p>
        <Steps steps={TALENT.journey} />
      </section>

      <section className="wrap py-20 md:py-28">
        <div className="grid gap-10 md:grid-cols-12">
          <h2 className="font-display text-[clamp(28px,3.6vw,52px)] md:col-span-4">
            What we do <span className="font-serif italic tracking-normal">for you.</span>
          </h2>
          <ul className="grid gap-x-8 sm:grid-cols-2 md:col-span-7 md:col-start-6">
            {TALENT.forYou.map((t) => (
              <li key={t} className="flex items-center gap-4 border-b border-line py-4 text-[17px]">
                <span className="grid h-6 w-6 shrink-0 place-items-center rounded-full bg-ink text-[12px] text-white">✓</span>
                {t}
              </li>
            ))}
          </ul>
        </div>
      </section>

      <section className="wrap py-20 md:py-28">
        <h2 className="font-display text-[clamp(28px,3.6vw,52px)]">
          Flexible <span className="font-serif italic tracking-normal">representation.</span>
        </h2>
        <div className="mt-10 grid gap-4 md:grid-cols-3">
          {TALENT.flexible.map((c) => (
            <FadeUp key={c.title} className="rounded-[6px] border border-line bg-white p-7">
              <h3 className="font-display text-[22px]">{c.title}</h3>
              <p className="mt-3 text-[16px] leading-relaxed text-ink-2">{c.body}</p>
            </FadeUp>
          ))}
        </div>
      </section>

      <Clients logos={images["home.clients"]} />

      <section id="apply" className="wrap grid scroll-mt-24 gap-10 py-20 md:grid-cols-12 md:py-28">
        <div className="md:col-span-4">
          <p className="eyebrow">Apply now</p>
          <h2 className="font-display mt-4 text-[clamp(30px,3.8vw,56px)]">
            Want Mode <span className="font-serif italic tracking-normal">to represent you?</span>
          </h2>
        </div>
        <div className="md:col-span-7 md:col-start-6">
          <TalentForm />
        </div>
      </section>
    </>
  );
}
