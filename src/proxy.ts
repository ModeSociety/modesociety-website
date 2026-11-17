import { NextResponse, type NextRequest } from "next/server";
import { isTechHost, TECH_HOST } from "@/lib/domains";

/**
 * Sends each domain to its own pages (one deployment serves both businesses). While
 * NEXT_PUBLIC_TECH_SITE_URL is unset, nothing changes and the Tech page stays at /tech.
 *
 * On modesocietytech.com: www goes to the bare domain, and the root shows the Tech page.
 */
export function proxy(req: NextRequest) {
  const host = (req.headers.get("x-forwarded-host") || req.headers.get("host") || "").toLowerCase().split(":")[0];
  if (!TECH_HOST || !isTechHost(host)) return NextResponse.next();

  const url = req.nextUrl;
  // www.modesocietytech.com → modesocietytech.com (one address for search engines)
  if (host !== TECH_HOST) {
    return NextResponse.redirect(new URL(url.pathname + url.search, `https://${TECH_HOST}`), 308);
  }
  // the Tech page at the root
  if (url.pathname === "/") return NextResponse.rewrite(new URL("/tech" + url.search, req.url));
  return NextResponse.next();
}

export const config = {
  // pages only: not Next's own files, the API, or public files (anything with an extension)
  matcher: ["/((?!_next/|api/|.*\\.[a-zA-Z0-9]+$).*)"],
};
