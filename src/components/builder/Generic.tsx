import Link from "next/link";
import BrandForm from "@/components/forms/BrandForm";
import PartnerForm from "@/components/forms/PartnerForm";
import TalentForm from "@/components/forms/TalentForm";
import { Accordion } from "@/components/sections/Blocks";
import Accent from "@/components/site/Accent";
import IntroVideo from "@/components/site/IntroVideo";
import Marquee from "@/components/site/Marquee";
import RichText from "@/components/site/RichText";
import TechForms from "@/components/tech/TechForms";
import { responsive } from "@/lib/img";
import { embedFor } from "@/lib/video";
import { photoSrc, type LayoutBlock, type Props, type Side } from "@/lib/builder";
import type { SiteContent } from "@/lib/slots";

type P = { b: LayoutBlock; side: Side; light: boolean; c: SiteContent };

const isExternal = (url: string) => /^https?:\/\//i.test(url);

function Btn({ label, url, light, ghost = false, side }: { label: string; url: string; light: boolean; ghost?: boolean; side: Side }) {
  if (!label || !url) return null;
  const cls = `btn ${ghost ? (light ? "ghost !border-white/60 !text-white hover:!text-ink [&::before]:!bg-white" : "ghost") : light && side === "talent" ? "light" : ""}`;
  return isExternal(url) ? (
    <a href={url} target="_blank" rel="noreferrer" className={cls}>
      {label} <span className="arrow">↗</span>
    </a>
  ) : (
    <Link href={url} className={cls}>
      {label} <span className="arrow">→</span>
    </Link>
  );
}

function Buttons({ p, light, side, center, className = "mt-8" }: { p: Props; light: boolean; side: Side; center: boolean; className?: string }) {
  if (!(p.buttonLabel && p.buttonUrl) && !(p.button2Label && p.button2Url)) return null;
  return (
    <div className={`flex flex-wrap gap-3 ${center ? "justify-center" : ""} ${className}`}>
      <Btn label={p.buttonLabel} url={p.buttonUrl} light={light} side={side} />
      <Btn label={p.button2Label} url={p.button2Url} light={light} side={side} ghost />
    </div>
  );
}

/** A photo at its own shape, never cropped. */
function Photo({ src, sizes, alt = "" }: { src: string; sizes: string; alt?: string }) {
  return (
    <div data-photo className="overflow-hidden">
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img {...responsive(src, sizes)} alt={alt} loading="lazy" className="h-auto w-full" />
    </div>
  );
}

const headingClass = (side: Side, light: boolean, size = "text-[clamp(44px,5.6vw,92px)]") => `font-display ${size} ${light ? "" : side === "tech" ? "text-t" : "text-ink"}`;
const accentClass = (side: Side) => (side === "tech" ? "t-grad" : "font-serif italic");
const lightText = "!text-white/85 [&_h2]:!text-white [&_h3]:!text-white [&_strong]:!text-white";

function Heading({ text, side, light, size }: { text: string; side: Side; light: boolean; size?: string }) {
  if (!text) return null;
  return (
    <h2 className={headingClass(side, light, size)}>
      <Accent text={text} className={accentClass(side)} />
    </h2>
  );
}

function Words({ b, side, light, center = false, button = true }: { b: LayoutBlock; side: Side; light: boolean; center?: boolean; button?: boolean }) {
  const p = b.props;
  if (!p.heading && !p.text && !(button && p.buttonLabel)) return null;
  return (
    <div data-words className={center ? "mx-auto max-w-3xl text-center" : ""}>
      <Heading text={p.heading} side={side} light={light} />
      {p.text && <RichText text={p.text} className={`${p.heading ? "mt-6" : ""} ${light ? lightText : ""} ${center ? "mx-auto max-w-2xl" : "max-w-2xl"}`} />}
      {button && <Buttons p={p} light={light} side={side} center={center} />}
    </div>
  );
}

const COLS: Record<string, string> = { "1": "", "2": "md:grid-cols-2", "3": "md:grid-cols-3", "4": "sm:grid-cols-2 lg:grid-cols-4" };
const BANNER: Record<string, string> = { s: "min-h-[40vh]", m: "min-h-[60vh]", l: "min-h-[80vh]", xl: "min-h-[100svh]", line: "min-h-[60vh]" };
const SPACE: Record<string, string> = { s: "h-8 md:h-12", m: "h-16 md:h-24", l: "h-24 md:h-40", xl: "h-40 md:h-64", line: "" };

function Body({ b, side, light, c }: P) {
  const p = b.props;
  const src = (id: string) => photoSrc(id, c.uploadsPublic);
  const center = b.style.align === "center";
  const [first] = p.photos;
  switch (b.type) {
    case "banner":
      return (
        <div className={`flex ${BANNER[p.size] ?? BANNER.m} flex-col justify-center ${center ? "items-center text-center" : ""}`}>
          <div data-words className={center ? "mx-auto max-w-5xl" : "max-w-5xl"}>
            <Heading text={p.heading} side={side} light={light} size="text-[clamp(56px,9vw,170px)] leading-[0.88]" />
            {p.text && <RichText text={p.text} className={`mt-6 text-[clamp(17px,1.5vw,22px)] ${light ? lightText : ""} ${center ? "mx-auto max-w-2xl" : "max-w-2xl"}`} />}
            <Buttons p={p} light={light} side={side} center={center} className="mt-10" />
          </div>
        </div>
      );
    case "image":
      return first ? (
        <figure className={center ? "text-center" : ""}>
          <Photo src={src(first)} sizes="(max-width: 1440px) 100vw, 1440px" alt={p.caption} />
          {p.caption && <figcaption className="mt-3 font-mono text-[11px] uppercase tracking-[0.04em] opacity-70">{p.caption}</figcaption>}
        </figure>
      ) : null;
    case "imageText":
      return (
        <div className="grid items-center gap-10 md:grid-cols-12 md:gap-14">
          {first && (
            <div className={`md:col-span-6 ${p.imageSide === "right" ? "md:order-2" : ""}`}>
              <Photo src={src(first)} sizes="(max-width: 767px) 100vw, 50vw" alt={p.heading.replace(/\*/g, "")} />
            </div>
          )}
          <div className={first ? "md:col-span-6" : "md:col-span-12"}>
            <Words b={b} side={side} light={light} />
          </div>
        </div>
      );
    case "gallery": {
      const n = p.photos.length;
      const cols = p.columns !== "3" ? { "1": "", "2": "md:columns-2", "4": "md:columns-4" }[p.columns] : n > 4 ? "md:columns-4" : n > 2 ? "md:columns-3" : "";
      return (
        <div>
          <Words b={b} side={side} light={light} center={center} />
          <div className={`columns-2 gap-3 md:gap-4 ${p.columns === "1" ? "!columns-1" : ""} ${cols} ${p.heading || p.text ? "mt-10" : ""}`}>
            {p.photos.map((id) => (
              <div key={id} className="mb-3 break-inside-avoid md:mb-4">
                <Photo src={src(id)} sizes="(max-width: 767px) 50vw, 25vw" />
              </div>
            ))}
          </div>
          {p.caption && <p className="mt-3 font-mono text-[11px] uppercase tracking-[0.04em] opacity-70">{p.caption}</p>}
        </div>
      );
    }
    case "video":
      return (
        <div>
          <Words b={b} side={side} light={light} center={center} />
          {embedFor(p.videoUrl) && (
            <div data-photo className={p.heading || p.text ? "mt-10" : ""}>
              <IntroVideo
                url={p.videoUrl}
                label={p.heading.replace(/\*/g, "") || "Video"}
                buttonClassName={side === "tech" ? "bg-white text-[#0b1438]" : "bg-paper text-ink !rounded-none font-mono !text-[12px] uppercase tracking-[0.06em]"}
              />
            </div>
          )}
        </div>
      );
    case "quote":
      return (
        <figure data-words className={`mx-auto max-w-5xl ${center ? "text-center" : ""}`}>
          <blockquote className={side === "tech" ? "tech-wide text-[clamp(30px,4vw,60px)]" : "font-serif text-[clamp(32px,4.8vw,72px)] leading-[1.08]"}>
            &ldquo;{p.text || p.heading}&rdquo;
          </blockquote>
          {p.caption && <figcaption className="mt-6 font-mono text-[12px] uppercase tracking-[0.06em] opacity-70">— {p.caption}</figcaption>}
        </figure>
      );
    case "cards":
      return (
        <div>
          <Words b={b} side={side} light={light} center={center} button={false} />
          <div className={`grid gap-4 ${COLS[p.columns] ?? COLS["3"]} ${p.heading || p.text ? "mt-10" : ""}`}>
            {p.items.map((it, i) => (
              <article
                key={i}
                data-words
                className={`flex flex-col ${side === "tech" ? "t-panel overflow-hidden" : light ? "border border-white/25" : "border border-espresso/15 bg-white"}`}
              >
                {it.photo && <Photo src={src(it.photo)} sizes="(max-width: 767px) 100vw, 33vw" alt={it.title} />}
                <div className="flex flex-1 flex-col p-7">
                  {it.title && <h3 className={headingClass(side, light, "text-[clamp(28px,2.6vw,40px)]")}>{it.title}</h3>}
                  {it.text && <RichText text={it.text} className={`mt-3 text-[16px] ${light ? lightText : ""}`} />}
                  {it.linkLabel && it.linkUrl && (
                    <span className="mt-auto pt-6">
                      <Btn label={it.linkLabel} url={it.linkUrl} light={light} side={side} ghost />
                    </span>
                  )}
                </div>
              </article>
            ))}
          </div>
        </div>
      );
    case "stats":
      return (
        <div>
          <Words b={b} side={side} light={light} center={center} button={false} />
          <div className={`grid gap-8 sm:grid-cols-2 ${p.items.length >= 4 ? "lg:grid-cols-4" : p.items.length === 3 ? "lg:grid-cols-3" : ""} ${p.heading || p.text ? "mt-12" : ""}`}>
            {p.items.map((it, i) => (
              <div key={i} data-words className={`border-l pl-6 ${light ? "border-white/30" : side === "tech" ? "border-tline2" : "border-espresso/20"}`}>
                <span className={`block ${side === "tech" ? "tech-display text-[clamp(56px,6.4vw,104px)]" : "font-display text-[clamp(64px,7vw,120px)] leading-[0.9]"} ${light ? "" : side === "tech" ? "text-taccent" : "text-ink"}`}>
                  {it.title}
                </span>
                {it.text && <span className={`mt-2 block max-w-[28ch] text-[15px] ${light ? "text-white/80" : side === "tech" ? "text-t2" : "text-ink-2"}`}>{it.text}</span>}
              </div>
            ))}
          </div>
        </div>
      );
    case "faq": {
      const items = p.items.filter((it) => it.title.trim());
      return (
        <div className="grid gap-10 md:grid-cols-12">
          {(p.heading || p.text) && (
            <div className="md:col-span-4">
              <Heading text={p.heading} side={side} light={light} size="text-[clamp(48px,5.6vw,92px)]" />
              {p.text && <RichText text={p.text} className={`mt-5 ${light ? lightText : ""}`} />}
            </div>
          )}
          <div className={p.heading || p.text ? "md:col-span-8" : "md:col-span-12"}>
            <Accordion
              tone={light ? "dark" : "light"}
              titleClassName={side === "tech" ? "text-[17px] font-medium" : "font-serif text-[clamp(22px,2.1vw,30px)] leading-snug"}
              items={items.map((it) => ({ title: it.title, body: <RichText text={it.text} className={light ? lightText : ""} /> }))}
            />
          </div>
        </div>
      );
    }
    case "buttons":
      return <Buttons p={p} light={light} side={side} center={center} className="" />;
    case "logos": {
      const logos = c.images[side === "tech" ? "tech.clients" : "home.clients"] ?? [];
      if (!logos.length) return null;
      const row = [...logos];
      while (row.length < 8) row.push(...logos);
      return (
        <div>
          {p.heading && (
            <div className={`mb-8 ${center ? "text-center" : ""}`}>
              <Heading text={p.heading} side={side} light={light} size="text-[clamp(40px,5vw,80px)]" />
            </div>
          )}
          <div className="-mx-[var(--gutter)]">
            <Marquee speed={36}>
              {row.map((l, i) => (
                <span key={`${l.src}-${i}`} className="mx-6 flex h-[clamp(48px,6vw,84px)] w-[clamp(120px,14vw,200px)] shrink-0 items-center justify-center md:mx-10">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={l.src} alt={l.alt} loading="lazy" draggable={false} className={`max-h-full max-w-full object-contain ${light ? "brightness-0 invert" : side === "tech" ? "opacity-70 brightness-0" : "mix-blend-multiply"}`} />
                </span>
              ))}
            </Marquee>
          </div>
        </div>
      );
    }
    case "form": {
      const intros = c.copy["site.forms"];
      const form =
        p.form === "brands" ? <BrandForm intro={intros.brands} /> :
        p.form === "talent" ? <TalentForm intro={intros.talent} /> :
        p.form === "partner" ? <PartnerForm intro={intros.partner} /> :
        p.form === "tech" ? <TechForms onPage /> : null;
      if (!form) return null;
      return (
        <div className="grid gap-10 md:grid-cols-12">
          {(p.heading || p.text) && (
            <div className="md:col-span-4">
              <Heading text={p.heading} side={side} light={light} size="text-[clamp(48px,6vw,96px)]" />
              {p.text && <RichText text={p.text} className={`mt-5 ${light ? lightText : ""}`} />}
            </div>
          )}
          <div className={`${p.heading || p.text ? "md:col-span-7 md:col-start-6" : "md:col-span-12"} ${side === "tech" && p.form === "tech" ? "t-panel p-6 md:p-10" : ""} text-left`}>{form}</div>
        </div>
      );
    }
    default:
      return <Words b={b} side={side} light={light} center={center} />;
  }
}

/** A general block: its content inside the page margins, spaced like the site's own sections. */
export default function Generic(props: P) {
  const { b, light } = props;
  if (b.type === "spacer") {
    return (
      <section aria-hidden className={b.props.size === "line" ? "py-10" : ""}>
        {b.props.size === "line" ? (
          <div className="wrap">
            <hr className={light ? "border-white/30" : props.side === "tech" ? "border-tline2" : "border-espresso/15"} />
          </div>
        ) : (
          <div className={SPACE[b.props.size] ?? SPACE.m} />
        )}
      </section>
    );
  }
  const filled = Boolean(b.style.bg || b.style.bgImage);
  const narrow = b.style.width === "narrow" ? "mx-auto max-w-4xl" : "";
  return (
    <section className={`${light ? "text-white" : ""} ${filled ? "py-20 md:py-28" : "py-14 md:py-20"}`}>
      <div className={b.style.width === "full" && ["image", "gallery", "video"].includes(b.type) ? "" : "wrap"}>
        <div className={narrow}>
          <Body {...props} />
        </div>
      </div>
    </section>
  );
}
