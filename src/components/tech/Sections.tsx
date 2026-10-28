import Link from "next/link";
import { Accordion } from "@/components/sections/Blocks";
import JsonLd from "@/components/site/JsonLd";
import Marquee from "@/components/site/Marquee";
import { FadeUp } from "@/components/site/Reveal";
import { faqJsonLd } from "@/lib/seo";
import { TECH_CATEGORIES, TECH_FORMATS, TECH_POLICY } from "@/lib/tech";
import type { SiteImage } from "@/lib/slots";
import { Beams, Eyebrow, SectionTitle } from "./ui";

/** Who we run campaigns for: four columns with a light that follows the cursor. */
export function Categories() {
  return (
    <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
      {TECH_CATEGORIES.map((c, i) => (
        <FadeUp key={c.title} delay={i * 0.06} className="t-panel t-foil group p-6">
          <div className="flex items-start justify-between gap-4">
            <h3 className="tech-mono text-[12px] uppercase leading-snug text-t">{c.title}</h3>
            <span className="text-taccent transition-transform duration-500 group-hover:translate-x-1">→</span>
          </div>
          <p className="mt-4 text-[14.5px] leading-relaxed text-t2">{c.body}</p>
        </FadeUp>
      ))}
    </div>
  );
}

/** The formats as a bento grid, each with a small animated drawing. */
export function Formats() {
  const [campaigns, ugc, streaming, events, management] = TECH_FORMATS;
  return (
    <div className="grid gap-3 md:grid-cols-6">
      {/* campaigns: several creators, one brand goal */}
      <FadeUp className="t-panel t-foil flex min-h-[300px] flex-col justify-between p-7 md:col-span-4">
        <div aria-hidden className="relative h-28">
          <svg viewBox="0 0 600 110" className="h-full w-full" fill="none">
            <defs>
              <linearGradient id="cl" x1="0" x2="1">
                <stop offset="0" stopColor="#89b2fd" stopOpacity="0" />
                <stop offset="1" stopColor="#89b2fd" />
              </linearGradient>
            </defs>
            <line x1="20" y1="55" x2="520" y2="55" stroke="url(#cl)" strokeWidth="2" strokeDasharray="6 8">
              <animate attributeName="stroke-dashoffset" from="0" to="-56" dur="2.4s" repeatCount="indefinite" />
            </line>
            {[40, 140, 240, 340, 440].map((x, i) => (
              <rect key={x} x={x - 22} y="25" width="44" height="60" rx="10" fill="#eef2fb" stroke="rgba(10,18,56,0.18)">
                <animate attributeName="stroke" values="rgba(10,18,56,0.18);#89b2fd;rgba(10,18,56,0.18)" dur="3s" begin={`${i * 0.45}s`} repeatCount="indefinite" />
              </rect>
            ))}
            <circle cx="545" cy="55" r="26" stroke="#89b2fd" strokeOpacity="0.5" />
            <circle cx="545" cy="55" r="9" fill="#a9c6ff" />
          </svg>
        </div>
        <div>
          <h3 className="tech-display text-[clamp(30px,3vw,44px)] text-t">{campaigns.title}</h3>
          <p className="mt-2 max-w-md text-[15px] text-t2">{campaigns.body}</p>
        </div>
      </FadeUp>

      {/* UGC: three clips, the middle one playing */}
      <FadeUp delay={0.05} className="t-panel t-foil flex min-h-[300px] flex-col justify-between p-7 md:col-span-2">
        <div aria-hidden className="flex h-28 items-end justify-center gap-2">
          <span className="h-20 w-12 rounded-[10px] bg-tsurface2 shadow-[inset_0_0_0_1px_rgba(10,18,56,0.12)]" />
          <span className="t-float grid h-28 w-16 place-items-center rounded-[12px] bg-[linear-gradient(180deg,#4b6ff5,#1d3278)] shadow-[0_10px_30px_-10px_#4b6ff5]">
            <span className="ml-1 h-0 w-0 border-y-[8px] border-l-[12px] border-y-transparent border-l-white" />
          </span>
          <span className="h-20 w-12 rounded-[10px] bg-tsurface2 shadow-[inset_0_0_0_1px_rgba(10,18,56,0.12)]" />
        </div>
        <div>
          <h3 className="tech-display text-[clamp(30px,3vw,44px)] text-t">{ugc.title}</h3>
          <p className="mt-2 text-[15px] text-t2">{ugc.body}</p>
        </div>
      </FadeUp>

      {/* streaming: a live signal */}
      <FadeUp className="t-panel t-foil flex min-h-[280px] flex-col justify-between p-7 md:col-span-2">
        <div aria-hidden className="relative grid h-28 place-items-center">
          {[0, 0.9, 1.8].map((d) => (
            <span key={d} className="t-ring absolute h-12 w-12 rounded-full border border-tblue/50" style={{ animationDelay: `${d}s` }} />
          ))}
          <span className="relative h-4 w-4 rounded-full bg-tblue shadow-[0_0_20px_#89b2fd]" />
          <span className="tech-mono t-live absolute right-0 top-0 inline-flex items-center gap-1.5 rounded-full bg-[#3e5ef1] px-2 py-0.5 text-[10px] uppercase text-white">
            <span className="h-1.5 w-1.5 rounded-full bg-white" /> Live
          </span>
        </div>
        <div>
          <h3 className="tech-display text-[clamp(30px,3vw,44px)] text-t">{streaming.title}</h3>
          <p className="mt-2 text-[15px] text-t2">{streaming.body}</p>
        </div>
      </FadeUp>

      {/* guest lists: a ticket */}
      <FadeUp delay={0.05} className="t-panel t-foil flex min-h-[280px] flex-col justify-between p-7 md:col-span-2">
        <div aria-hidden className="flex h-28 items-center">
          <div className="relative flex h-16 w-full max-w-[280px] items-center justify-between rounded-[12px] bg-tsurface2 px-5 shadow-[inset_0_0_0_1px_rgba(10,18,56,0.12)] transition-transform duration-500 hover:-rotate-2">
            <span className="tech-mono text-[11px] uppercase text-t2">Guest list</span>
            <span className="tech-display text-[30px] text-taccent">+1</span>
            <span className="absolute -left-2 top-1/2 h-4 w-4 -translate-y-1/2 rounded-full bg-tground" />
            <span className="absolute -right-2 top-1/2 h-4 w-4 -translate-y-1/2 rounded-full bg-tground" />
          </div>
        </div>
        <div>
          <h3 className="tech-display text-[clamp(30px,3vw,44px)] text-t">{events.title}</h3>
          <p className="mt-2 text-[15px] text-t2">{events.body}</p>
        </div>
      </FadeUp>

      {/* management: who we look after */}
      <FadeUp delay={0.1} className="t-panel t-foil flex min-h-[280px] flex-col justify-between p-7 md:col-span-2">
        <p aria-hidden className="tech-display text-[26px] leading-[1] text-t/90">
          Creators.
          <br />
          <span className="text-t/70">Streamers.</span>
          <br />
          <span className="text-t/50">Players.</span>
          <br />
          <span className="text-taccent">Teams.</span>
        </p>
        <div>
          <h3 className="tech-display text-[clamp(30px,3vw,44px)] text-t">{management.title}</h3>
          <p className="mt-2 text-[15px] text-t2">{management.body}</p>
        </div>
      </FadeUp>
    </div>
  );
}

/** "Brands our creators have worked with": a logo slideshow, or an honest empty state. */
export function TechLogos({ logos }: { logos: SiteImage[] }) {
  if (!logos.length) {
    return (
      <section className="border-y border-tline py-14 md:py-16">
        <div className="wrap grid items-center gap-8 md:grid-cols-12">
          <div className="md:col-span-5">
            <Eyebrow>Brands our creators have worked with</Eyebrow>
            <h2 className="tech-display mt-3 text-[clamp(36px,4vw,56px)] text-t">This space is open.</h2>
            <p className="mt-3 max-w-md text-[15px] text-t2">ModeSociety Tech is new. Partner logos appear here once a deal is signed and the partner has approved it.</p>
            <Link href="/tech/contact?as=brand" className="btn ghost mt-6">
              Brand enquiry <span className="arrow">→</span>
            </Link>
          </div>
          <div aria-hidden className="relative overflow-hidden md:col-span-7 [mask-image:linear-gradient(90deg,transparent,#000_15%,#000_85%,transparent)]">
            <Marquee speed={30}>
              {Array.from({ length: 6 }).map((_, i) => (
                <span key={i} className="mx-1.5 grid h-20 w-36 shrink-0 place-items-center rounded-[14px] bg-tsurface shadow-[inset_0_0_0_1px_rgba(10,18,56,0.1)]">
                  <span className={`rounded-md border border-dashed border-tline2 ${["h-3 w-20", "h-8 w-8 rounded-full", "h-8 w-5", "h-6 w-6", "h-3 w-16", "h-4 w-12"][i]}`} />
                </span>
              ))}
            </Marquee>
          </div>
        </div>
      </section>
    );
  }
  return (
    <section className="border-y border-tline py-14 md:py-16" aria-label="Brands our creators have worked with">
      <div className="wrap mb-8">
        <Eyebrow>Brands our creators have worked with</Eyebrow>
      </div>
      <Marquee speed={34}>
        {logos.map((l, i) => (
          <span key={`${l.src}-${i}`} className="mx-8 flex h-14 w-36 shrink-0 items-center justify-center md:mx-12">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={l.src} alt={l.alt} loading="lazy" draggable={false} className="max-h-full max-w-full object-contain opacity-70 brightness-0" />
          </span>
        ))}
      </Marquee>
    </section>
  );
}

/** The 18+ policy band. */
export function Policy() {
  return (
    <section className="relative overflow-hidden border-y border-tline py-20 md:py-28">
      <Beams />
      <div className="wrap relative">
        <SectionTitle title={TECH_POLICY.title} lead={TECH_POLICY.body} />
        <div className="mt-12 grid gap-8 sm:grid-cols-3">
          {TECH_POLICY.stats.map((s) => (
            <FadeUp key={s.label} className="border-l border-tline2 pl-6">
              <span className="tech-display block text-[clamp(56px,6.4vw,104px)] text-taccent">{s.value}</span>
              <span className="mt-2 block max-w-[24ch] text-[14px] text-t2">{s.label}</span>
            </FadeUp>
          ))}
        </div>
      </div>
    </section>
  );
}

/** Questions and answers, with FAQ data for search engines. */
export function TechFaq({ groups }: { groups: { label: string; items: { q: string; a: string }[] }[] }) {
  return (
    <section className="wrap py-20 md:py-28" aria-label="Frequently asked questions">
      <SectionTitle title="Questions, answered." lead="If yours isn't here, ask us." />
      <div className={`mt-12 grid gap-10 ${groups.length > 1 ? "md:grid-cols-2" : ""}`}>
        {groups.map((g) => (
          <div key={g.label}>
            <Eyebrow className="mb-3">{g.label}</Eyebrow>
            <Accordion
              titleClassName="text-[17px] font-medium text-t"
              items={g.items.map((f) => ({ title: f.q, body: <p className="max-w-xl text-t2">{f.a}</p> }))}
            />
          </div>
        ))}
      </div>
      <JsonLd data={faqJsonLd(groups.flatMap((g) => g.items))} />
    </section>
  );
}
