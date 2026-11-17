/**
 * The two businesses' domains. Mode Society is www.modesociety.com.au; ModeSociety Tech moves to
 * modesocietytech.com (bought 10 Nov 2026). One codebase and one deployment serve both: the proxy
 * (src/proxy.ts) sends each domain to its own pages.
 *
 * The split is off until NEXT_PUBLIC_TECH_SITE_URL is set (e.g. https://modesocietytech.com), so the
 * code can go live before the domain's DNS does; until then the Tech page stays at /tech.
 */
export const MAIN_SITE_URL = (process.env.NEXT_PUBLIC_SITE_URL || "https://www.modesociety.com.au").replace(/\/$/, "");
export const TECH_SITE_URL = (process.env.NEXT_PUBLIC_TECH_SITE_URL || "").replace(/\/$/, "");

const hostOf = (url: string) => {
  try {
    return url ? new URL(url).hostname.toLowerCase() : "";
  } catch {
    return "";
  }
};

/** modesocietytech.com, or "" while the split is off */
export const TECH_HOST = hostOf(TECH_SITE_URL);
export const MAIN_HOST = hostOf(MAIN_SITE_URL);

/** www.example.com → example.com, so both spellings of a domain match */
const bare = (host: string) => host.toLowerCase().split(":")[0].replace(/^www\./, "");

/** Whether a request's host is the Tech domain (either spelling). */
export const isTechHost = (host: string) => Boolean(TECH_HOST) && bare(host) === bare(TECH_HOST);
/** Whether a request's host is Mode Society's own domain (either spelling). */
export const isMainHost = (host: string) => Boolean(MAIN_HOST) && bare(host) === bare(MAIN_HOST);
