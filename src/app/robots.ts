import type { MetadataRoute } from "next";
import { headers } from "next/headers";
import { isTechHost, TECH_SITE_URL } from "@/lib/domains";
import { SITE_URL } from "@/lib/seo";

/**
 * Everyone may crawl the public site, including AI search assistants (ChatGPT, Perplexity,
 * Claude, Gemini…), which increasingly answer "which agency should I use?" questions.
 * The admin panel and the API stay out of search. Each domain points to its own sitemap.
 */
export default async function robots(): Promise<MetadataRoute.Robots> {
  const host = (await headers()).get("host") || "";
  const base = TECH_SITE_URL && isTechHost(host) ? TECH_SITE_URL : SITE_URL;
  return {
    rules: [{ userAgent: "*", allow: "/", disallow: ["/admin", "/api/"] }],
    sitemap: `${base}/sitemap.xml`,
    host: base,
  };
}
