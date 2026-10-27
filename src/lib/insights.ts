/** Site traffic, recorded by /api/track into the "Visits" tab and summarised by the backend's getStats. */

export const SOURCES = ["organic", "social", "direct", "referral", "campaign"] as const;
export type Source = (typeof SOURCES)[number];

export const SOURCE_LABELS: Record<Source, string> = {
  organic: "Organic search",
  social: "Social",
  direct: "Direct",
  referral: "Referral",
  campaign: "Campaign / ads",
};

/** Fixed categorical order, validated on the white panel surface (dataviz validate_palette: all checks pass). */
export const SOURCE_COLORS: Record<Source, string> = {
  organic: "#A3242B",
  social: "#A9822F",
  direct: "#3B6FD0",
  referral: "#7A9A2E",
  campaign: "#8B5CC4",
};

const SEARCH = /(^|\.)(google\.[a-z.]+|bing\.com|duckduckgo\.com|search\.yahoo\.com|yahoo\.com|ecosia\.org|baidu\.com|yandex\.[a-z]+|search\.brave\.com|startpage\.com)$/i;
const SOCIAL =
  /(^|\.)(instagram\.com|facebook\.com|fb\.com|m\.facebook\.com|l\.facebook\.com|t\.co|twitter\.com|x\.com|tiktok\.com|linkedin\.com|lnkd\.in|pinterest\.[a-z.]+|youtube\.com|reddit\.com|threads\.net|snapchat\.com|whatsapp\.com)$/i;

/** Classifies where a session came from, from its landing page's referrer and query string. */
export function classifySource(referrer: string, query: string, siteHost: string): { source: Source; host: string; campaign: string } {
  const q = new URLSearchParams(query);
  const campaign = [q.get("utm_source"), q.get("utm_campaign")].filter(Boolean).join(" / ").slice(0, 120);
  let host = "";
  try {
    host = referrer ? new URL(referrer).hostname.replace(/^www\./, "").toLowerCase() : "";
  } catch {
    host = "";
  }
  if (host && host === siteHost.replace(/^www\./, "")) host = "";
  if (q.get("gclid") || q.get("msclkid") || /cpc|ppc|paid/i.test(q.get("utm_medium") || "")) return { source: "campaign", host, campaign: campaign || "Paid ads" };
  if (campaign) return { source: "campaign", host, campaign };
  if (!host) return { source: q.get("fbclid") ? "social" : "direct", host, campaign };
  if (SEARCH.test(host)) return { source: "organic", host, campaign };
  if (SOCIAL.test(host)) return { source: "social", host, campaign };
  return { source: "referral", host, campaign };
}

export type Stats = {
  range: { from: string; to: string; days: number };
  totals: Totals;
  previous: Totals;
  daily: ({ date: string; pageviews: number } & Record<Source, number>)[];
  sources: Partial<Record<Source, number>>;
  pages: { key: string; value: number }[];
  referrers: { key: string; value: number }[];
  devices: Record<string, number>;
  countries: { key: string; value: number }[];
  side?: "all" | "talent" | "tech";
  forms: {
    talent: number;
    bookings: number;
    partners: number;
    techBrands?: number;
    techCreators?: number;
    previous: { talent: number; bookings: number; partners: number; techBrands?: number; techCreators?: number };
  };
  schedule: { upcoming: number; thisPeriod: number };
};

type Totals = { pageviews: number; sessions: number; visitors: number; newVisitors: number; organic: number; pagesPerSession: number };
