import type { MetadataRoute } from "next";
import { headers } from "next/headers";
import { getSiteContent } from "@/lib/backend";
import { isTechHost, TECH_SITE_URL } from "@/lib/domains";
import { PAGES, SITE_URL, type PageKey } from "@/lib/seo";

const PRIORITY: Record<PageKey, number> = {
  home: 1,
  brands: 0.9,
  talent: 0.9,
  services: 0.8,
  work: 0.8,
  about: 0.7,
  contact: 0.6,
  press: 0.4,
  techHome: 0.9,
};

/**
 * /sitemap.xml, per domain. modesocietytech.com lists the Tech page only. Mode Society's lists every
 * public page of its own: "Featured in" joins once there's press on it, with a page per feature, and
 * the Tech page (/tech) only until it moves to its own domain.
 */
export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const host = (await headers()).get("host") || "";
  if (TECH_SITE_URL && isTechHost(host)) {
    return [{ url: `${TECH_SITE_URL}/`, lastModified: new Date(), changeFrequency: "monthly", priority: 1 }];
  }
  const { images, press } = await getSiteContent();
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
    .filter((k) => (k !== "press" || hasPress) && !(k === "techHome" && TECH_SITE_URL))
    .map((k) => ({
      url: `${SITE_URL}${PAGES[k].path === "/" ? "" : PAGES[k].path}`,
      lastModified: now,
      changeFrequency: k === "work" || k === "press" ? "weekly" : "monthly",
      priority: PRIORITY[k],
    }));
  return [...pages, ...features];
}
