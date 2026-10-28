import type { Metadata } from "next";
import JsonLd from "@/components/site/JsonLd";
import { breadcrumbJsonLd, pageMetadata } from "@/lib/seo";
import Link from "next/link";
import Accent from "@/components/site/Accent";
import { Mark, SectionHead } from "@/components/site/Editorial";
import { FadeUp, RiseLines } from "@/components/site/Reveal";
import WorkMedia, { workNo } from "@/components/work/WorkMedia";
import { getSiteContent } from "@/lib/backend";
import { SLOTS } from "@/lib/slots";

export const metadata: Metadata = pageMetadata("work");

/* a loose editorial rhythm of crops down the grid; videos stay portrait */
const SHAPES = ["aspect-[4/5]", "aspect-[3/4]", "aspect-square", "aspect-[4/5]", "aspect-[2/3]", "aspect-[4/5]"];

export default async function OurWork() {
  const { images, copy } = await getSiteContent();
  const hero = copy["work.hero"];
  const gallery = copy["work.gallery"];
  const next = copy["work.next"];
  // the last few words of the intro get the red marker underline
  const words = hero.body.trim().split(" ");
  const tail = words.length > 4 ? words.splice(-3).join(" ") : "";
  const work = images["work.gallery"] ?? [];
  const clientsLabel = SLOTS.find((s) => s.id === "home.clients")?.label;
  const brands = Array.from(new Set((images["home.clients"] ?? []).map((l) => l.alt.trim()).filter((a) => a && a !== clientsLabel)));

  return (
    <>
      <JsonLd data={breadcrumbJsonLd("work")} />
      <section className="wrap pb-12 pt-28 md:pb-16 md:pt-36">
        <SectionHead index="Archive" label={hero.label} meta={hero.meta} />
        <div className="mt-6 flex flex-wrap items-end gap-x-5">
          <RiseLines as="h1" immediate delay={0.1} className="font-display text-[clamp(96px,17vw,290px)] leading-[0.82] text-ink" lines={[hero.heading]} />
          {hero.accent && (
            <FadeUp delay={0.4}>
              <span className="font-serif block pb-[0.18em] text-[clamp(56px,9vw,160px)] italic leading-none text-red">{hero.accent}</span>
            </FadeUp>
          )}
        </div>
        <FadeUp delay={0.5} className="mt-8 grid gap-6 md:grid-cols-12">
          <p className="text-[clamp(17px,1.4vw,20px)] leading-relaxed text-ink-2 md:col-span-6">
            {words.join(" ")}
            {tail && (
              <>
                {" "}
                <Mark kind="underline" delay={0.8}>
                  {tail}
                </Mark>
              </>
            )}
          </p>
          <p className="font-mono text-[11px] font-medium uppercase leading-[1.9] tracking-[0.04em] text-muted md:col-span-4 md:col-start-9 md:text-right">
            {hero.side.map((l, i) => (
              <span key={i} className="block">
                {l}
              </span>
            ))}
          </p>
        </FadeUp>
      </section>

      <section className="wrap grid gap-12 pb-24 md:grid-cols-12 md:gap-8 md:pb-32">
        {/* brand index, like the contents page of a lookbook */}
        <aside className="order-2 md:sticky md:top-28 md:order-none md:col-span-3 md:self-start">
          <SectionHead label={`${gallery.brandsLabel} (${brands.length})`} />
          <ul className="mt-2">
            {brands.map((b, i) => (
              <li key={b} className="flex items-baseline justify-between gap-3 border-b border-espresso/15 py-2">
                <span className={`font-serif text-[clamp(22px,1.9vw,28px)] leading-tight text-ink ${i % 2 ? "italic" : ""}`}>{b}</span>
                <sup className="font-mono text-[10px] text-muted">{String(i + 1).padStart(2, "0")}</sup>
              </li>
            ))}
          </ul>
          {gallery.button && (
            <Link href="/get-in-touch?form=brands" className="btn mt-8">
              {gallery.button} <span className="arrow">↗</span>
            </Link>
          )}
        </aside>

        <div className="md:col-span-9">
          <div className="flex items-end justify-between gap-6">
            <h2 className="font-display text-[clamp(48px,6vw,96px)] text-ink">{gallery.heading}</h2>
            <span className="pb-2 font-mono text-[11px] font-medium uppercase tracking-[0.04em] text-muted">{work.length} pieces</span>
          </div>
          <div className="mt-6 columns-2 gap-2 md:columns-3 md:gap-3">
            {work.map((m, i) => {
              const piece = (
                <>
                  <WorkMedia item={m} eager={i < 3} className={m.type === "video" ? "aspect-[9/16]" : SHAPES[i % SHAPES.length]} />
                  <p className="mt-2 font-mono text-[12px] font-medium uppercase tracking-[0.04em] text-muted">
                    <span className="text-ink">{workNo(i)}</span> — {m.alt}
                  </p>
                </>
              );
              // the first row is on screen straight away, so it shows without the fade-in
              return i < 3 ? (
                <div key={`${m.src}-${i}`} className="group mb-2 break-inside-avoid md:mb-3">
                  {piece}
                </div>
              ) : (
                <FadeUp key={`${m.src}-${i}`} className="group mb-2 break-inside-avoid md:mb-3">
                  {piece}
                </FadeUp>
              );
            })}
          </div>
        </div>
      </section>

      {!next.hidden && (
        <section className="bg-ink py-20 text-white md:py-28">
          <div className="wrap">
            <SectionHead tone="dark" index="Next" label={next.label} meta={next.meta} />
            <div className="mt-8 flex flex-col justify-between gap-10 md:flex-row md:items-end">
              <h2 className="font-display text-[clamp(64px,10vw,170px)]">
                <Accent text={next.heading} />
              </h2>
              <div className="flex flex-wrap gap-3 md:pb-4">
                {next.brandsButton && (
                  <Link href="/work-with-us" className="btn light">
                    {next.brandsButton} <span className="arrow">→</span>
                  </Link>
                )}
                {next.talentButton && (
                  <Link href="/apply-to-be-a-creator" className="btn ghost !border-white/60 !text-white hover:!text-ink [&::before]:!bg-white">
                    {next.talentButton} <span className="arrow">→</span>
                  </Link>
                )}
              </div>
            </div>
          </div>
        </section>
      )}
    </>
  );
}
