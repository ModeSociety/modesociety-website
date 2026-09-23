import type { Metadata } from "next";
import DualCta from "@/components/home/DualCta";
import { FadeUp, RiseLines } from "@/components/site/Reveal";
import { getSiteContent } from "@/lib/backend";

export const metadata: Metadata = { title: "Contact" };

export default async function Contact() {
  const { images } = await getSiteContent();
  return (
    <>
      <section className="wrap grid gap-10 pb-20 pt-32 md:grid-cols-12 md:pb-28 md:pt-44">
        <div className="md:col-span-7">
          <p className="eyebrow">Let&apos;s chat</p>
          <RiseLines
            as="h1"
            immediate
            delay={0.15}
            className="font-display mt-5 text-[clamp(36px,6vw,96px)]"
            lines={["We'd love to", <span key="h" className="font-serif italic tracking-normal">hear from you.</span>]}
          />
        </div>
        <FadeUp delay={0.4} className="grid content-end gap-5 text-lg text-ink-2 md:col-span-5">
          <p>
            Whether you&apos;re a UGC creator, model, influencer, or a brand looking to source talent for your next campaign or
            event, we&apos;d love to connect.
          </p>
          <p>
            From talent representation and campaign casting to end-to-end social media campaign seeding and influencer event
            lists, we&apos;re here to bring the right people together and create work that stands out.
          </p>
          <p className="font-serif text-2xl italic text-ink">Tell us your vision, and let&apos;s create something unforgettable.</p>
          <a href="mailto:pr@modesociety.com.au" className="link-underline self-start text-base">
            pr@modesociety.com.au
          </a>
        </FadeUp>
      </section>
      <DualCta brands={images["contact.brands"]?.[0]} talent={images["contact.talent"]?.[0]} />
    </>
  );
}
