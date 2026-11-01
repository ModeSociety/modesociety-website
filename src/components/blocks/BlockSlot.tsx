import Link from "next/link";
import IntroVideo from "@/components/site/IntroVideo";
import Accent from "@/components/site/Accent";
import RichText from "@/components/site/RichText";
import { responsive } from "@/lib/img";
import { embedFor } from "@/lib/video";
import type { ShownBlock } from "@/lib/blocks";
import Animated from "./Animated";

type Side = "talent" | "tech";

const isExternal = (url: string) => /^https?:\/\//i.test(url);

function Button({ b, light }: { b: ShownBlock; light: boolean }) {
  if (!b.buttonLabel || !b.buttonUrl) return null;
  const cls = `btn mt-8 ${light ? "light" : ""}`;
  return isExternal(b.buttonUrl) ? (
    <a href={b.buttonUrl} target="_blank" rel="noreferrer" className={cls}>
      {b.buttonLabel} <span className="arrow">↗</span>
    </a>
  ) : (
    <Link href={b.buttonUrl} className={cls}>
      {b.buttonLabel} <span className="arrow">→</span>
    </Link>
  );
}

/** A photo at its own shape, never cropped. */
function Photo({ p, sizes, alt = "" }: { p: { src: string }; sizes: string; alt?: string }) {
  return (
    <div data-photo className="overflow-hidden">
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img {...responsive(p.src, sizes)} alt={alt} loading="lazy" className="h-auto w-full" />
    </div>
  );
}

function Words({ b, side, light, center = false }: { b: ShownBlock; side: Side; light: boolean; center?: boolean }) {
  if (!b.heading && !b.text && !b.buttonLabel) return null;
  return (
    <div data-words className={center ? "mx-auto max-w-3xl text-center" : ""}>
      {b.heading && (
        <h2 className={`font-display text-[clamp(44px,5.6vw,92px)] ${light ? "" : "text-ink"}`}>
          <Accent text={b.heading} className={side === "tech" ? "t-grad" : "font-serif italic"} />
        </h2>
      )}
      {b.text && <RichText text={b.text} className={`mt-6 ${light ? "!text-white/85 [&_h2]:!text-white [&_h3]:!text-white [&_strong]:!text-white" : ""} ${center ? "mx-auto max-w-2xl" : "max-w-2xl"}`} />}
      <Button b={b} light={light} />
    </div>
  );
}

function Body({ b, side, light }: { b: ShownBlock; side: Side; light: boolean }) {
  const [first] = b.photos;
  switch (b.type) {
    case "image":
      return first ? (
        <figure>
          <Photo p={first} sizes="(max-width: 1440px) 100vw, 1440px" alt={b.caption} />
          {b.caption && <figcaption className="mt-3 font-mono text-[11px] uppercase tracking-[0.04em] opacity-70">{b.caption}</figcaption>}
        </figure>
      ) : null;
    case "imageText":
      return (
        <div className="grid items-center gap-10 md:grid-cols-12 md:gap-14">
          {first && (
            <div className={`md:col-span-6 ${b.imageSide === "right" ? "md:order-2" : ""}`}>
              <Photo p={first} sizes="(max-width: 767px) 100vw, 50vw" alt={b.heading} />
            </div>
          )}
          <div className={first ? "md:col-span-6" : "md:col-span-12"}>
            <Words b={b} side={side} light={light} />
          </div>
        </div>
      );
    case "gallery":
      return (
        <div>
          <Words b={b} side={side} light={light} />
          <div className={`columns-2 gap-3 md:gap-4 ${b.photos.length > 4 ? "md:columns-4" : b.photos.length > 2 ? "md:columns-3" : ""} ${b.heading || b.text ? "mt-10" : ""}`}>
            {b.photos.map((p) => (
              <div key={p.fileId} className="mb-3 break-inside-avoid md:mb-4">
                <Photo p={p} sizes="(max-width: 767px) 50vw, 25vw" />
              </div>
            ))}
          </div>
          {b.caption && <p className="mt-3 font-mono text-[11px] uppercase tracking-[0.04em] opacity-70">{b.caption}</p>}
        </div>
      );
    case "video":
      return (
        <div>
          <Words b={b} side={side} light={light} />
          {embedFor(b.videoUrl) && (
            <div data-photo className={b.heading || b.text ? "mt-10" : ""}>
              <IntroVideo url={b.videoUrl} label={b.heading || "Video"} buttonClassName={side === "tech" ? "bg-white text-[#0b1438]" : "bg-paper text-ink !rounded-none font-mono !text-[12px] uppercase tracking-[0.06em]"} />
            </div>
          )}
        </div>
      );
    case "quote":
      return (
        <figure data-words className="mx-auto max-w-5xl">
          <blockquote className={`${side === "tech" ? "tech-wide text-[clamp(30px,4vw,60px)]" : "font-serif text-[clamp(32px,4.8vw,72px)] leading-[1.08]"}`}>
            &ldquo;{b.text || b.heading}&rdquo;
          </blockquote>
          {b.caption && <figcaption className="mt-6 font-mono text-[12px] uppercase tracking-[0.06em] opacity-70">— {b.caption}</figcaption>}
        </figure>
      );
    default:
      return <Words b={b} side={side} light={light} />;
  }
}

/** The blocks added in the admin panel for one spot on a page (nothing when there are none). */
export default function BlockSlot({ blocks, spot, side = "talent" }: { blocks: ShownBlock[]; spot: string; side?: Side }) {
  const here = blocks.filter((b) => b.visible && b.spot === spot);
  if (!here.length) return null;
  return (
    <>
      {here.map((b) => {
        const light = b.tone === "brand";
        const tone = light ? "bg-ink text-white" : b.tone === "tint" ? "bg-paper-2" : "";
        return (
          <section key={b.id} className={`${tone} ${tone ? "py-20 md:py-28" : "py-14 md:py-20"}`}>
            <div className="wrap">
              <Animated kind={b.animation} from={b.imageSide === "right" ? "right" : "left"} className={b.width === "narrow" ? "mx-auto max-w-4xl" : ""}>
                <Body b={b} side={side} light={light} />
              </Animated>
            </div>
          </section>
        );
      })}
    </>
  );
}
