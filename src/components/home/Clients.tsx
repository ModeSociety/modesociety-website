import Marquee from "@/components/site/Marquee";
import type { SiteImage } from "@/lib/slots";

export default function Clients({ logos }: { logos: SiteImage[] }) {
  if (!logos.length) return null;
  return (
    <section className="border-y border-line py-12">
      <p className="eyebrow wrap mb-8">Brands we&apos;ve worked with</p>
      <Marquee speed={40}>
        {logos.map((l, i) => (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            key={i}
            src={l.src}
            alt={l.alt}
            className="mx-10 h-10 w-auto object-contain opacity-70 grayscale transition hover:opacity-100 hover:grayscale-0 md:mx-16 md:h-14"
          />
        ))}
      </Marquee>
    </section>
  );
}
