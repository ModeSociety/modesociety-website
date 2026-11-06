import { revalidateTag } from "next/cache";
import { after } from "next/server";
import { SITE_TAG } from "./backend";

/** The pages rebuilt straight after an edit, so the next visitor gets them fresh. */
const WARM = ["/about", "/work-with-us", "/apply-to-be-a-creator", "/services", "/our-work", "/featured-in", "/get-in-touch", "/tech"];

/**
 * After an edit in the admin panel. Visitors never wait on the backend: pages keep being served
 * from the cache while they're rebuilt in the background (stale-while-revalidate), and the main
 * pages are requested right after the save so the rebuild starts at once, not on someone's click.
 */
export function refreshSite(req: Request, extra: string[] = []) {
  revalidateTag(SITE_TAG, "max");
  const origin = new URL(req.url).origin;
  const hit = (path: string) => fetch(origin + path, { cache: "no-store" }).catch(() => undefined);
  after(async () => {
    await hit("/"); // the first one refreshes the shared content; the rest then rebuild from it
    await Promise.all([...WARM, ...extra].map(hit));
  });
}
