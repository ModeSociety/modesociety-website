import type { Metadata } from "next";
import GetInTouch, { type FormKey } from "@/components/forms/GetInTouch";
import { InstagramIcon, LinkedInIcon } from "@/components/site/Icons";
import { FadeUp, RiseLines } from "@/components/site/Reveal";
import { GET_IN_TOUCH, INSTAGRAM_URL, LINKEDIN_URL } from "@/lib/content";

export const metadata: Metadata = { title: "Get in touch" };

const KEYS: FormKey[] = ["talent", "brands", "partner"];

export default async function GetInTouchPage({ searchParams }: { searchParams: Promise<Record<string, string | string[] | undefined>> }) {
  const q = await searchParams;
  const form = KEYS.find((k) => k === q.form) ?? null;
  const tech = q.for === "tech";
  return (
    <>
      <section className="wrap pb-10 pt-32 md:pt-44">
        <RiseLines as="h1" immediate delay={0.15} className="font-display text-[clamp(44px,8vw,128px)]" lines={[GET_IN_TOUCH.heading]} />
        <FadeUp delay={0.3}>
          <p className="font-serif mt-4 max-w-3xl text-[clamp(22px,2.6vw,38px)] italic leading-snug">{GET_IN_TOUCH.line}</p>
        </FadeUp>
      </section>

      <GetInTouch initial={form} partnerTypeHint={tech ? "Tech company" : ""} />

      <section className="wrap pb-24 pt-10 md:pb-32">
        <div className="flex flex-col items-start gap-5 border-t border-line pt-10 md:flex-row md:items-center md:justify-between">
          <p className="font-serif text-[clamp(22px,2.4vw,34px)] italic">{GET_IN_TOUCH.socials}</p>
          <div className="flex gap-3 text-ink">
            <a href={INSTAGRAM_URL} target="_blank" rel="noreferrer" aria-label="Mode Society on Instagram" className="social-icon">
              <InstagramIcon />
            </a>
            {LINKEDIN_URL && (
              <a href={LINKEDIN_URL} target="_blank" rel="noreferrer" aria-label="Mode Society on LinkedIn" className="social-icon">
                <LinkedInIcon />
              </a>
            )}
          </div>
        </div>
      </section>
    </>
  );
}
