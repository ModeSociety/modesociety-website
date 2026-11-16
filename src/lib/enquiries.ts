/** Form submissions as the admin panel shows them (read back from the Sheet's form tabs). */

export type EnquiryKind = "talent" | "brands" | "techBrands" | "techCreators";

/** creator: an application from a creator (signed with a contract); otherwise a brand lead */
export const ENQUIRY_KINDS: { id: EnquiryKind; label: string; tab: string; side: "talent" | "tech"; creator: boolean }[] = [
  { id: "talent", label: "Talent", tab: "Talent", side: "talent", creator: true },
  { id: "brands", label: "Brand calls", tab: "Book a Call", side: "talent", creator: false },
  { id: "techBrands", label: "Tech brands", tab: "Tech Brand Enquiries", side: "tech", creator: false },
  { id: "techCreators", label: "Tech creators", tab: "Tech Creator Applications", side: "tech", creator: true },
];

/** A creator lead's path to signing, and a brand lead's path to a deal (Asha's brief, 16 Nov 2026). */
export const CREATOR_STATUSES = ["New", "Reviewing", "Contract sent", "Signed", "Declined"] as const;
export const BRAND_STATUSES = ["New", "Contacted", "Proposal sent", "Won", "Lost"] as const;
export const ENQUIRY_STATUSES = [...new Set([...CREATOR_STATUSES, ...BRAND_STATUSES])];
/** the end of the road: these leads can be deleted for good */
export const CLOSED_STATUSES = new Set<string>(["Declined", "Lost"]);

const isCreator = (kind: EnquiryKind) => ENQUIRY_KINDS.find((k) => k.id === kind)!.creator;
export const statusesFor = (kind: EnquiryKind): readonly string[] => (isCreator(kind) ? CREATOR_STATUSES : BRAND_STATUSES);

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
  return old[s]?.[isCreator(kind) ? 0 : 1] ?? "New";
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
  /** talent screenshots (Drive file IDs) and the application's Drive folder */
  files: string[];
  folderUrl: string;
};

export type SheetTable = { headers: string[]; rows: string[][] };

const SKIP = new Set(["Submitted At", "Status", "Reference", "Email", "Screenshots", "Application Folder"]);
const TITLE: Record<EnquiryKind, [string, string]> = {
  talent: ["Full Name", "What They Do"],
  brands: ["Brand Name", "Your Name"],
  techBrands: ["Brand Name", "Your Name"],
  techCreators: ["Full Name", "Applying As"],
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
  return rows.map((row) => ({
    kind,
    reference: col(row, "Reference"),
    submittedAt: col(row, "Submitted At"),
    status: normalStatus(kind, col(row, "Status")),
    title: col(row, titleCol) || "Untitled",
    subtitle: col(row, subCol),
    email: col(row, "Email"),
    fields: headers
      .map((label, i) => ({ label, value: String(row[i] ?? "").trim() }))
      .filter((f) => f.value && !SKIP.has(f.label) && f.label !== titleCol),
    files: [...col(row, "Screenshots").matchAll(/\/d\/([-\w]{10,})/g)].map((m) => m[1]),
    folderUrl: col(row, "Application Folder"),
  }));
}
