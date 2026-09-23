import { ParallaxImage } from "@/components/about/AboutFx";
import { FadeUp, RiseLines } from "@/components/site/Reveal";
import type { SiteImage } from "@/lib/slots";

export default function FormPage({
  eyebrow,
  title,
  intro,
  image,
  children,
}: {
  eyebrow: string;
  title: React.ReactNode[];
  intro: React.ReactNode;
  image?: SiteImage;
  children: React.ReactNode;
}) {
  return (
    <section className="wrap grid gap-12 pb-24 pt-28 md:grid-cols-12 md:pt-36">
      <div className="md:col-span-5">
        <div className="md:sticky md:top-28">
          <p className="eyebrow">{eyebrow}</p>
          <RiseLines as="h1" immediate delay={0.15} className="font-display mt-5 text-[clamp(34px,4.6vw,72px)]" lines={title} />
          <FadeUp delay={0.4} className="mt-6 max-w-md text-ink-2">
            {intro}
          </FadeUp>
          <ParallaxImage image={image} className="mt-10 hidden aspect-[4/5] w-full max-w-sm md:block" />
        </div>
      </div>
      <div className="md:col-span-6 md:col-start-7 md:pt-4">{children}</div>
    </section>
  );
}
