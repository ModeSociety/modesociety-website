import type { MetadataRoute } from "next";
import { getSiteContent } from "@/lib/backend";
import { PAGES, SITE_URL, type PageKey } from "@/lib/seo";

export const revalidate = 3600;

const PRIORITY: Record<PageKey, number> = {
  home: 1,
  brands: 0.9,
  talent: 0.9,
  services: 0.8,
  work: 0.8,
  about: 0.7,
  contact: 0.6,
  partner: 0.5,
  press: 0.4,
  techHome: 0.9,
  techBrands: 0.8,
  techCreators: 0.8,
  techTalent: 0.7,
  techContact: 0.6,
};

/**
 * /sitemap.xml: every public page. "Featured in" joins once there's press on it, with a page per
 * feature, and the Tech sub-pages once ModeSociety Tech is launched.
 */
export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const { images, press, settings } = await getSiteContent();
  const hasPress = (images["press.logos"]?.length ?? 0) > 0 || press.length > 0;
  const now = new Date();
  const features: MetadataRoute.Sitemap = press.map((a) => ({
    url: `${SITE_URL}/featured-in/${a.slug}`,
    lastModified: now,
    changeFrequency: "yearly",
    priority: 0.4,
    images: a.photos.slice(0, 1).map((p) => `${SITE_URL}${p.src}`),
  }));
  const pages: MetadataRoute.Sitemap = (Object.keys(PAGES) as PageKey[])
    .filter((k) => k !== "press" || hasPress)
    // before launch, /tech is the only public Tech page
    .filter((k) => settings.techLaunched || !PAGES[k].tech || k === "techHome")
    .map((k) => ({
      url: `${SITE_URL}${PAGES[k].path === "/" ? "" : PAGES[k].path}`,
      lastModified: now,
      changeFrequency: k === "work" || k === "press" || k === "techTalent" ? "weekly" : "monthly",
      priority: PRIORITY[k],
    }));
  return [...pages, ...features];
}
