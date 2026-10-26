import type { MetadataRoute } from "next";
import { SITE_URL } from "@/lib/seo";

/**
 * Everyone may crawl the public site, including AI search assistants (ChatGPT, Perplexity,
 * Claude, Gemini…), which increasingly answer "which agency should I use?" questions.
 * The admin panel and the API stay out of search.
 */
export default function robots(): MetadataRoute.Robots {
  return {
    rules: [{ userAgent: "*", allow: "/", disallow: ["/admin", "/api/"] }],
    sitemap: `${SITE_URL}/sitemap.xml`,
    host: SITE_URL,
  };
}
