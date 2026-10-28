import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import JsonLd from "@/components/site/JsonLd";
import RichText from "@/components/site/RichText";
import { PressCard } from "@/components/press/Press";
import { SectionHead } from "@/components/site/Editorial";
import { FadeUp } from "@/components/site/Reveal";
import { getSiteContent } from "@/lib/backend";
import { responsive } from "@/lib/img";
import { pressDate, pressTeaser } from "@/lib/press";
import { ogImageUrl, PAGES, SITE_NAME, SITE_URL } from "@/lib/seo";

type Props = { params: Promise<{ slug: string }> };

async function find(slug: string) {
  const { press } = await getSiteContent();
  const i = press.findIndex((a) => a.slug === slug);
  return { item: i >= 0 ? press[i] : null, others: press.filter((_, j) => j !== i) };
}

export async function generateStaticParams() {
  const { press } = await getSiteContent();
  return press.map((a) => ({ slug: a.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { item } = await find((await params).slug);
  if (!item) return { title: "Not found", robots: { index: false } };
  const path = `/featured-in/${item.slug}`;
  const title = `${item.title} | ${item.outlet} | ${SITE_NAME}`;
  const description = pressTeaser(item, 155);
  const image = item.photos[0] ? { url: item.photos[0].src, alt: item.title } : { url: ogImageUrl(item.outlet), width: 1200, height: 630, alt: item.title };
  return {
    title: { absolute: title },
    description,
    alternates: { canonical: path },
    openGraph: { type: "article", url: path, siteName: SITE_NAME, locale: "en_AU", title, description, images: [image] },
    twitter: { card: "summary_large_image", title, description, images: [image.url] },
  };
}

export default async function Feature({ params }: Props) {
  const { item, others } = await find((await params).slug);
  if (!item) notFound();
  const [cover, ...gallery] = item.photos;
  const url = `${SITE_URL}/featured-in/${item.slug}`;
  const iso = /^\d{4}-\d{2}-\d{2}$/.test(item.date) ? item.date : undefined;

  return (
    <>
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@graph": [
            {
              "@type": "Article",
              "@id": `${url}#article`,
              headline: item.title,
              description: pressTeaser(item, 155),
              url,
              ...(iso ? { datePublished: iso } : {}),
              ...(cover ? { image: `${SITE_URL}${cover.src}` } : {}),
              ...(item.href ? { isBasedOn: item.href } : {}),
              about: { "@id": `${SITE_URL}/#organization` },
              publisher: { "@id": `${SITE_URL}/#organization` },
            },
            {
              "@type": "BreadcrumbList",
              itemListElement: [
                { "@type": "ListItem", position: 1, name: PAGES.home.crumb, item: SITE_URL },
                { "@type": "ListItem", position: 2, name: PAGES.press.crumb, item: `${SITE_URL}${PAGES.press.path}` },
                { "@type": "ListItem", position: 3, name: item.outlet, item: url },
              ],
            },
          ],
        }}
      />

      <article>
        <header className="wrap pt-28 md:pt-36">
          <SectionHead
            index="Press"
            label={item.outlet}
            meta={
              <Link href="/featured-in" className="link-underline text-ink">
                ← All features
              </Link>
            }
          />
          <FadeUp className="mt-8 max-w-5xl">
            <p className="font-mono text-[11px] font-medium uppercase tracking-[0.04em] text-muted">
              As featured in <span className="text-ink">{item.outlet}</span>
              {item.date && <span> · {pressDate(item.date)}</span>}
            </p>
            <h1 className="font-serif mt-4 text-[clamp(44px,6.4vw,104px)] italic leading-[1.02] text-ink">{item.title}</h1>
            {item.excerpt && <p className="mt-6 max-w-2xl text-[clamp(18px,1.6vw,22px)] leading-relaxed text-ink-2">{item.excerpt}</p>}
          </FadeUp>
        </header>

        {cover && (
          <div className="wrap mt-12 md:mt-16">
            <div className="grain overflow-hidden bg-paper-2">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img {...responsive(cover.src, "(max-width: 1440px) 100vw, 1440px")} alt={item.title} fetchPriority="high" className="max-h-[86svh] w-full object-cover" />
            </div>
          </div>
        )}

        <div className="wrap grid gap-12 py-16 md:grid-cols-12 md:py-24">
          <div className="md:col-span-7 md:col-start-2">
            {item.body ? <RichText text={item.body} /> : <p className="rich">{item.excerpt}</p>}
            {gallery.length > 0 && (
              <div className="mt-14 grid gap-4 sm:grid-cols-2">
                {gallery.map((p, i) => (
                  <div key={p.fileId} className={`grain overflow-hidden bg-paper-2 ${gallery.length % 2 === 1 && i === 0 ? "sm:col-span-2" : ""}`}>
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img {...responsive(p.src, "(max-width: 639px) 100vw, 40vw", 1200)} alt="" loading="lazy" className="w-full object-cover" />
                  </div>
                ))}
              </div>
            )}
          </div>
          <aside className="md:col-span-3 md:col-start-10">
            <div className="grid gap-5 border-t border-espresso/15 pt-4 md:sticky md:top-28">
              <dl className="grid gap-3 font-mono text-[11px] font-medium uppercase tracking-[0.04em]">
                <div>
                  <dt className="text-muted">Publication</dt>
                  <dd className="mt-1 text-ink">{item.outlet}</dd>
                </div>
                {item.date && (
                  <div>
                    <dt className="text-muted">Published</dt>
                    <dd className="mt-1 text-ink">{pressDate(item.date)}</dd>
                  </div>
                )}
              </dl>
              {item.href && (
                <a href={item.href} target="_blank" rel="noreferrer" className="btn w-fit">
                  Read on {item.outlet} <span className="arrow">↗</span>
                </a>
              )}
              <Link href="/get-in-touch" className="link-underline w-fit font-mono text-[12px] font-medium uppercase tracking-[0.04em] text-ink">
                Press enquiries
              </Link>
            </div>
          </aside>
        </div>
      </article>

      {others.length > 0 && (
        <section className="wrap pb-20 md:pb-28">
          <SectionHead index="More" label="More features" meta={<Link href="/featured-in" className="link-underline text-ink">All press ↗</Link>} className="mb-10" />
          <div className="grid gap-x-8 gap-y-14 sm:grid-cols-2 lg:grid-cols-3">
            {others.slice(0, 3).map((a) => (
              <PressCard key={a.id} item={a} sizes="(max-width: 639px) 100vw, (max-width: 1023px) 50vw, 33vw" />
            ))}
          </div>
        </section>
      )}
    </>
  );
}
