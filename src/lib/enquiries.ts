/** Form submissions as the admin panel shows them (read back from the Sheet's form tabs). */

export type EnquiryKind = "talent" | "brands" | "partners" | "techBrands" | "techCreators";

export const ENQUIRY_KINDS: { id: EnquiryKind; label: string; tab: string; side: "talent" | "tech" }[] = [
  { id: "talent", label: "Talent", tab: "Talent", side: "talent" },
  { id: "brands", label: "Brand calls", tab: "Book a Call", side: "talent" },
  { id: "partners", label: "Partnerships", tab: "Partnerships", side: "talent" },
  { id: "techBrands", label: "Tech brands", tab: "Tech Brand Enquiries", side: "tech" },
  { id: "techCreators", label: "Tech creators", tab: "Tech Creator Applications", side: "tech" },
];

export const ENQUIRY_STATUSES = ["New", "Reviewing", "Contacted", "Signed / Booked", "Declined"] as const;
export type EnquiryStatus = (typeof ENQUIRY_STATUSES)[number];

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
  partners: ["Business Name", "Your Name"],
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
    status: col(row, "Status") || "New",
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
