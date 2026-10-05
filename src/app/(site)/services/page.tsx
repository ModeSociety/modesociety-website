import type { Metadata } from "next";
import Link from "next/link";
import { FadeUp, RiseLines } from "@/components/site/Reveal";
import { SERVICES_PAGE } from "@/lib/content";
import type { SiteImage } from "@/lib/slots";
import { getSiteContent } from "@/lib/backend";

export const metadata: Metadata = { title: "Services" };

function Media({ items }: { items: SiteImage[] }) {
  const list = items.slice(0, 3);
  if (!list.length) return null;
  return (
    <div className={`grid gap-3 ${list.length > 1 ? "grid-cols-2" : ""}`}>
      {list.map((m, i) => (
        <div key={`${m.src}-${i}`} className={`overflow-hidden rounded-[4px] bg-paper-2 ${list.length === 3 && i === 0 ? "col-span-2 aspect-[16/10]" : "aspect-[4/5]"}`}>
          {m.type === "video" ? (
            <video src={m.src} muted loop autoPlay playsInline preload="metadata" className="h-full w-full object-cover" aria-label={m.alt} />
          ) : (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={m.src} alt={m.alt} loading="lazy" className="h-full w-full object-cover" />
          )}
        </div>
      ))}
    </div>
  );
}

export default async function ServicesPage() {
  const { images } = await getSiteContent();
  return (
    <>
      <section className="wrap pb-10 pt-32 md:pt-44">
        <p className="eyebrow">Services</p>
        <RiseLines
          as="h1"
          immediate
          delay={0.15}
          className="font-display mt-5 text-[clamp(40px,6.4vw,100px)]"
          lines={["Five ways", <span key="t" className="font-serif italic tracking-normal">we work with brands.</span>]}
        />
        <nav aria-label="Jump to a service" className="mt-10 flex flex-wrap gap-2">
          {SERVICES_PAGE.map((s) => (
            <a key={s.id} href={`#${s.id}`} className="chip">
              <span className="font-display text-[12px]">{s.number}</span> {s.title}
            </a>
          ))}
        </nav>
      </section>

      {SERVICES_PAGE.map((s, idx) => (
        <section key={s.id} id={s.id} className={`scroll-mt-20 py-20 md:py-28 ${idx % 2 ? "bg-white" : ""}`}>
          <div className="wrap grid gap-12 md:grid-cols-12">
            <div className={`md:col-span-5 ${idx % 2 ? "md:order-2 md:col-start-8" : ""}`}>
              <FadeUp>
                <Media items={images[s.media] ?? []} />
              </FadeUp>
            </div>
            <div className={`md:col-span-6 ${idx % 2 ? "md:order-1 md:col-start-1" : "md:col-start-7"}`}>
              <span className="font-display text-[clamp(40px,5vw,72px)] leading-none">{s.number}</span>
              <h2 className="font-display mt-3 text-[clamp(28px,3.4vw,50px)]">{s.title}</h2>
              <p className="mt-5 text-[clamp(17px,1.4vw,20px)] leading-relaxed text-ink-2">{s.summary}</p>

              <h3 className="eyebrow mt-10 !text-ink">How it works</h3>
              <ol className="mt-3 flex flex-wrap items-center gap-x-2 gap-y-2 text-[15px]">
                {s.steps.map((step, i) => (
                  <li key={step} className="flex items-center gap-2">
                    <span className="rounded-full border border-ink px-3 py-1">{step}</span>
                    {i < s.steps.length - 1 && <span aria-hidden>→</span>}
                  </li>
                ))}
              </ol>

              <h3 className="eyebrow mt-10 !text-ink">What you get</h3>
              <ul className="mt-3 grid gap-2.5 text-[16px] leading-snug">
                {s.get.map((g) => (
                  <li key={g} className="flex gap-3">
                    <span className="mt-[8px] h-1.5 w-1.5 shrink-0 rounded-full bg-ink" /> {g}
                  </li>
                ))}
              </ul>

              <h3 className="eyebrow mt-10 !text-ink">Who it&apos;s for</h3>
              <p className="mt-3 text-[16px] leading-relaxed">{s.who}</p>

              {s.extra && (
                <div className="mt-10 rounded-[6px] border border-line bg-paper p-6">
                  <h3 className="font-display text-[20px]">{s.extra.title}</h3>
                  <ul className="mt-3 grid gap-2 text-[15px] leading-relaxed text-ink-2">
                    {s.extra.points.map((p) => (
                      <li key={p}>— {p}</li>
                    ))}
                  </ul>
                </div>
              )}

              <div className="mt-10 flex flex-wrap gap-3">
                {s.buttons.map((b, i) =>
                  b.external ? (
                    <a key={b.label} href={b.href} target="_blank" rel="noreferrer" className={`btn ${i ? "ghost" : ""}`}>
                      {b.label}
                    </a>
                  ) : (
                    <Link key={b.label} href={b.href} className={`btn ${i ? "ghost" : ""}`}>
                      {b.label} <span className="arrow">→</span>
                    </Link>
                  ),
                )}
              </div>
            </div>
          </div>
        </section>
      ))}
    </>
  );
}
