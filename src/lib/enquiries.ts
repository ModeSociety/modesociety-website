import { parseChannels, profileUrl } from "./channels";

/** Form submissions as the admin panel shows them (read back from the Sheet's form tabs). */

export type EnquiryKind = "talent" | "brands" | "techBrands" | "techCreators" | "services" | "techServices";

/**
 * creator: an application from a creator (signed with a contract); booking: a Book now booking from a
 * Services page (confirmed and invoiced by hand); otherwise a brand lead.
 */
export const ENQUIRY_KINDS: { id: EnquiryKind; label: string; tab: string; side: "talent" | "tech"; creator: boolean; booking?: boolean }[] = [
  { id: "talent", label: "Talent", tab: "Talent", side: "talent", creator: true },
  { id: "brands", label: "Brand calls", tab: "Book a Call", side: "talent", creator: false },
  { id: "services", label: "Service bookings", tab: "Service Bookings", side: "talent", creator: false, booking: true },
  { id: "techBrands", label: "Tech brands", tab: "Tech Brand Enquiries", side: "tech", creator: false },
  { id: "techCreators", label: "Tech creators", tab: "Tech Creator Applications", side: "tech", creator: true },
  { id: "techServices", label: "Service bookings", tab: "Tech Service Bookings", side: "tech", creator: false, booking: true },
];

/** A creator lead's path to signing, and a brand lead's path to a deal (Asha's brief, 16 Nov 2026). */
export const CREATOR_STATUSES = ["New", "Reviewing", "Contract sent", "Signed", "Declined"] as const;
export const BRAND_STATUSES = ["New", "Contacted", "Proposal sent", "Won", "Lost"] as const;
/** a service booking: confirmed, invoiced by hand and paid (17 Nov 2026: no online payment) */
export const BOOKING_STATUSES = ["New", "Confirmed", "Invoiced", "Paid", "Cancelled"] as const;
export const ENQUIRY_STATUSES = [...new Set([...CREATOR_STATUSES, ...BRAND_STATUSES, ...BOOKING_STATUSES])];
/** the end of the road: these leads can be deleted for good */
export const CLOSED_STATUSES = new Set<string>(["Declined", "Lost", "Cancelled"]);

const isCreator = (kind: EnquiryKind) => ENQUIRY_KINDS.find((k) => k.id === kind)!.creator;
const isBooking = (kind: EnquiryKind) => Boolean(ENQUIRY_KINDS.find((k) => k.id === kind)!.booking);
export const statusesFor = (kind: EnquiryKind): readonly string[] => (isCreator(kind) ? CREATOR_STATUSES : isBooking(kind) ? BOOKING_STATUSES : BRAND_STATUSES);

/** A status as the Sheet holds it, in this lead type's list; statuses from before 16 Nov 2026 map to the nearest. */
export function normalStatus(kind: EnquiryKind, raw: string): string {
  const s = raw.trim();
  if (statusesFor(kind).includes(s)) return s;
  const old: Record<string, [string, string]> = {
    // [creator, brand]
    Reviewing: ["Reviewing", "Contacted"],
    Contacted: ["Reviewing", "Contacted"],
    "Signed / Booked": ["Signed", "Won"],
    Declined: ["Declined", "Lost"],
  };
  const mapped = old[s]?.[isCreator(kind) ? 0 : 1];
  return mapped && statusesFor(kind).includes(mapped) ? mapped : "New";
}

export type Enquiry = {
  kind: EnquiryKind;
  reference: string;
  submittedAt: string;
  status: string;
  /** who: a person (talent) or the brand/business */
  title: string;
  subtitle: string;
  email: string;
  /** every other answer, in Sheet column order */
  fields: { label: string; value: string }[];
  /** talent screenshots and photos (Drive file IDs) and the application's Drive folder */
  files: string[];
  folderUrl: string;
  /** a creator lead's summary for the list (the new application's columns, or the old form's) */
  creator?: CreatorSummary;
  /** a Tech brand lead's summary for the list (enquiries from 17 Nov 2026 on) */
  brand?: BrandSummary;
};

export type BrandSummary = {
  contact: string;
  industry: string;
  budget: string;
  /** YYYY-MM-DD */
  start: string;
  platforms: string;
  /** Drive file id of an uploaded brief or deck ("" when none, or when it was shared as a link) */
  brief: string;
};

export type CreatorSummary = {
  /** Drive file id of the round profile crop, or the first photo */
  photo: string;
  platform: string;
  channel: string;
  channelUrl: string | null;
  followers: number | null;
  representation: string;
  country: string;
  region: string;
  tags: string[];
};

/** 12400 → "12.4K", 1200000 → "1.2M" (Asha's list format). */
export function formatCount(n: number | null): string {
  if (n === null) return "—";
  if (n >= 1_000_000) return `${+(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000) return `${+(n / 1_000).toFixed(1)}K`;
  return String(n);
}

/** "12K", "1.2M", "12,400" or "12400" as a number (old leads typed their counts freely). */
export function parseCount(v: string): number | null {
  const m = v.trim().replace(/,/g, "").match(/^(\d+(?:\.\d+)?)\s*([kKmM]?)$/);
  if (!m) return null;
  const n = parseFloat(m[1]) * (m[2].toLowerCase() === "m" ? 1_000_000 : m[2].toLowerCase() === "k" ? 1_000 : 1);
  return Math.round(n);
}

const FLAG_CODES: Record<string, string> = {
  Australia: "AU", "United States": "US", "United Kingdom": "GB", Japan: "JP", "United Arab Emirates": "AE", "New Zealand": "NZ",
  Canada: "CA", Ireland: "IE", Singapore: "SG", "South Korea": "KR", Philippines: "PH", Indonesia: "ID", Malaysia: "MY", India: "IN",
  Germany: "DE", France: "FR", Brazil: "BR", Mexico: "MX",
};
/** A country's flag emoji, or "" for one not in the list. */
export const flagOf = (country: string) => {
  const code = FLAG_CODES[country];
  return code ? String.fromCodePoint(...[...code].map((c) => 0x1f1e6 + c.charCodeAt(0) - 65)) : "";
};
const AU_SHORT: Record<string, string> = {
  "Australian Capital Territory": "ACT", "New South Wales": "NSW", "Northern Territory": "NT", Queensland: "QLD",
  "South Australia": "SA", Tasmania: "TAS", Victoria: "VIC", "Western Australia": "WA",
};
/** "🇦🇺 VIC", "🇯🇵 Tokyo": the list's location column. */
export const placeOf = (c: Pick<CreatorSummary, "country" | "region">) => [flagOf(c.country), AU_SHORT[c.region] ?? c.region].filter(Boolean).join(" ");

export type SheetTable = { headers: string[]; rows: string[][] };

const SKIP = new Set(["Submitted At", "Status", "Reference", "Email", "Screenshots", "Application Folder"]);
const TITLE: Record<EnquiryKind, [string, string]> = {
  // creators: the creator name when the new application gave one (see toEnquiries)
  talent: ["Full Name", "What They Do"],
  brands: ["Brand Name", "Your Name"],
  techBrands: ["Brand Name", "Your Name"],
  techCreators: ["Full Name", "Applying As"],
  services: ["Name", "Service"],
  techServices: ["Name", "Service"],
};

/** Maps Sheet rows to enquiries by column name, so reordering columns in the Sheet doesn't break it. */
export function toEnquiries(kind: EnquiryKind, table: SheetTable | undefined): Enquiry[] {
  if (!table) return [];
  const { headers, rows } = table;
  const col = (row: string[], name: string) => {
    const i = headers.indexOf(name);
    return i < 0 ? "" : String(row[i] ?? "").trim();
  };
  const [titleCol, subCol] = TITLE[kind];
  const creator = kind === "talent" || kind === "techCreators";
  const idOf = (link: string) => link.match(/\/d\/([-\w]{10,})/)?.[1] ?? "";
  /** the list's summary: the new application's columns, falling back to the old form's first channel */
  const summary = (row: string[]): CreatorSummary => {
    const old = parseChannels(col(row, "Channels (handle · followers)") || col(row, "Channels (platform · handle · followers)"))[0];
    const platform = col(row, "Main Platform") || old?.platform || "";
    return {
      photo: idOf(col(row, "Profile Photo (Round)")) || idOf(col(row, "Profile Photo")) || idOf(col(row, "Screenshots")),
      platform,
      channel: col(row, "Main Channel") || old?.handle || "",
      channelUrl: col(row, "Main Channel") ? profileUrl(platform, col(row, "Main Channel")) : (old?.url ?? null),
      followers: parseCount(col(row, "Main Followers") || old?.followers || ""),
      representation: col(row, "Representation"),
      country: col(row, "Country"),
      region: col(row, "State / Region") || col(row, "Region"),
      tags: col(row, "Tags").split(/\r?\n/).map((t) => t.trim()).filter(Boolean),
    };
  };
  return rows.map((row) => {
    // a creator is listed by their creator name when the new application gave one; the column shown as
    // the title isn't repeated in the details (so the legal name stays there)
    const titleFrom = creator && col(row, "Creator Name") ? "Creator Name" : col(row, "Company") ? "Company" : titleCol;
    const brand = kind === "techBrands" && col(row, "Company") !== "";
    return {
    kind,
    reference: col(row, "Reference"),
    submittedAt: col(row, "Submitted At"),
    status: normalStatus(kind, col(row, "Status")),
    title: col(row, titleFrom) || "Untitled",
    subtitle: col(row, subCol) || col(row, "Contact Name") || (creator ? col(row, "Main Platform") : ""),
    ...(creator ? { creator: summary(row) } : {}),
    ...(brand
      ? {
          brand: {
            contact: col(row, "Contact Name"),
            industry: col(row, "Industry"),
            budget: col(row, "Budget"),
            start: col(row, "Start Date"),
            platforms: col(row, "Platforms"),
            brief: idOf(col(row, "Brief")),
          },
        }
      : {}),
    email: col(row, "Email"),
    fields: headers
      .map((label, i) => ({ label, value: String(row[i] ?? "").trim() }))
      .filter((f) => f.value && !SKIP.has(f.label) && f.label !== titleFrom),
    files: [...new Set(["Screenshots", "Photos", "Profile Photo (Round)"].flatMap((h) => [...col(row, h).matchAll(/\/d\/([-\w]{10,})/g)].map((m) => m[1])))],
    folderUrl: col(row, "Application Folder"),
    };
  });
}
