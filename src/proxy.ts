import { NextResponse, type NextRequest } from "next/server";
import { isMainHost, isTechHost, MAIN_SITE_URL, TECH_HOST, TECH_SITE_URL } from "@/lib/domains";

/** The old Tech pages (one page since 6 Nov 2026) and the section of the new page each one became. */
const OLD_TECH: Record<string, string> = {
  "/tech": "",
  "/tech/brands": "#campaigns",
  "/tech/creators": "#apply",
  "/tech/talent": "#who",
  "/tech/contact": "#contact",
};

/** The Tech site's other pages: their address on modesocietytech.com → the page that serves it. */
const TECH_PAGES: Record<string, string> = { "/services": "/tech/services" };

/** Addresses without a file extension that the Tech page needs on its own domain (Next's dev tools too). */
const TECH_OWN = ["/media", "/og", "/__nextjs_original-stack-frame", "/__nextjs_source-map", "/__nextjs_font"];

/**
 * Sends each domain to its own pages (one deployment serves both businesses). While
 * NEXT_PUBLIC_TECH_SITE_URL is unset, nothing changes and the Tech page stays at /tech.
 *
 * - modesocietytech.com: www goes to the bare domain, and the root shows the Tech page; /tech there
 *   goes to the root. Mode Society's pages (and the admin panel) go to www.modesociety.com.au.
 * - www.modesociety.com.au: the Tech page and its old pages move to modesocietytech.com (permanent,
 *   so search engines carry their ranking over).
 */
export function proxy(req: NextRequest) {
  const host = (req.headers.get("x-forwarded-host") || req.headers.get("host") || "").toLowerCase().split(":")[0];
  const url = req.nextUrl;
  const path = url.pathname.replace(/\/+$/, "") || "/";
  const split = Boolean(TECH_HOST) && (isTechHost(host) || isMainHost(host));

  // without the split (or on a preview/local address), the old Tech pages go to their section of /tech
  if (!split) {
    if (path in OLD_TECH && path !== "/tech") return NextResponse.redirect(new URL("/tech" + url.search + OLD_TECH[path], req.url), 308);
    return NextResponse.next();
  }

  if (isTechHost(host)) {
    // www.modesocietytech.com → modesocietytech.com (one address for search engines)
    if (host !== TECH_HOST) return NextResponse.redirect(new URL(url.pathname + url.search, `https://${TECH_HOST}`), 308);
    // the Tech page at the root
    if (path === "/") return NextResponse.rewrite(new URL("/tech" + url.search, req.url));
    if (path in TECH_PAGES) return NextResponse.rewrite(new URL(TECH_PAGES[path] + url.search, req.url));
    // /tech/services there → /services
    const own = Object.keys(TECH_PAGES).find((k) => TECH_PAGES[k] === path);
    if (own) return NextResponse.redirect(new URL(own + url.search, `https://${TECH_HOST}`), 308);
    if (path in OLD_TECH) return NextResponse.redirect(new URL("/" + url.search + OLD_TECH[path], `https://${TECH_HOST}`), 308);
    // what the Tech page itself loads: Drive photos and its share image
    if (TECH_OWN.some((p) => path === p || path.startsWith(p + "/"))) return NextResponse.next();
    // anything else is Mode Society's (its pages, the admin panel): the same page on its own domain
    return NextResponse.redirect(new URL(url.pathname + url.search, MAIN_SITE_URL), 308);
  }

  if (isMainHost(host) && path in OLD_TECH) {
    return NextResponse.redirect(new URL("/" + url.search + OLD_TECH[path], TECH_SITE_URL), 308);
  }
  // the Tech site's other pages move to its domain too
  const moved = isMainHost(host) && Object.keys(TECH_PAGES).find((k) => TECH_PAGES[k] === path);
  if (moved) return NextResponse.redirect(new URL(moved + url.search, TECH_SITE_URL), 308);
  return NextResponse.next();
}

export const config = {
  // pages only: not Next's own files, the API, or public files (anything with an extension)
  matcher: ["/((?!_next/|api/|.*\\.[a-zA-Z0-9]+$).*)"],
};
