import type { MetadataRoute } from "next";
import { getSiteContent } from "@/lib/backend";
import { PRESS } from "@/lib/content";
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
};

/** /sitemap.xml: every public page. "Featured in" joins once there's press on it. */
export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const { images } = await getSiteContent();
  const hasPress = (images["press.logos"]?.length ?? 0) > 0 || PRESS.length > 0;
  const now = new Date();
  return (Object.keys(PAGES) as PageKey[])
    .filter((k) => k !== "press" || hasPress)
    .map((k) => ({
      url: `${SITE_URL}${PAGES[k].path === "/" ? "" : PAGES[k].path}`,
      lastModified: now,
      changeFrequency: k === "work" || k === "press" ? "weekly" : "monthly",
      priority: PRIORITY[k],
    }));
}
