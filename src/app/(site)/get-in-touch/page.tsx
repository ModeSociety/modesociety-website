import type { Metadata } from "next";
import GetInTouch, { type FormKey } from "@/components/forms/GetInTouch";
import { FadeUp, RiseLines } from "@/components/site/Reveal";
import SocialLinks from "@/components/site/SocialLinks";
import { GET_IN_TOUCH } from "@/lib/content";

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
          <SocialLinks className="text-ink" />
        </div>
      </section>
    </>
  );
}
